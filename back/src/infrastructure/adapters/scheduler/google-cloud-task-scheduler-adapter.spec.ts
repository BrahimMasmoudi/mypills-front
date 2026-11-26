import { GoogleCloudTaskSchedulerAdapter } from './google-cloud-task-scheduler-adapter'
import { CloudTasksClient } from '@google-cloud/tasks'

// 1. Mock the Google Cloud Tasks Client
jest.mock('@google-cloud/tasks')

describe('GoogleCloudTaskSchedulerAdapter', () => {
    let adapter: GoogleCloudTaskSchedulerAdapter
    let mockClientInstance: any

    const config = {
        project: 'test-project',
        location: 'europe-west3',
        queue: 'reminder-queue',
        targetUrl: 'https://example.com/webhook',
        serviceAccountEmail: 'service-acc@test.com',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        // 2. Setup the mock methods
        mockClientInstance = {
            queuePath: jest.fn().mockReturnValue('projects/test/locations/loc/queues/q'),
            createTask: jest.fn().mockResolvedValue([{ name: 'tasks/my-task-id' }]),
        };

        // 3. Make the mocked constructor return our instance
        (CloudTasksClient as unknown as jest.Mock).mockImplementation(() => mockClientInstance)

        adapter = new GoogleCloudTaskSchedulerAdapter(
            config.project,
            config.location,
            config.queue,
            config.targetUrl,
            config.serviceAccountEmail
        )
    })

    it('should correctly format the task and call createTask', async () => {
        // Arrange
        const reminderId = 'rem-123'
        const scheduledTime = new Date('2026-01-20T14:00:00Z')
        const payload = { userId: 'user-1', medName: 'Doliprane' }

        // Act
        const taskName = await adapter.scheduleNotificationTask(reminderId, scheduledTime, payload)

        // Assert
        // Check Queue Path construction
        expect(mockClientInstance.queuePath).toHaveBeenCalledWith(
            config.project,
            config.location,
            config.queue
        )

        // Check Task structure
        expect(mockClientInstance.createTask).toHaveBeenCalledWith({
            parent: 'projects/test/locations/loc/queues/q',
            task: expect.objectContaining({
                name: `projects/test/locations/loc/queues/q/tasks/rem-123-${scheduledTime.getTime()}`,
                httpRequest: expect.objectContaining({
                    url: config.targetUrl,
                    httpMethod: 'POST',
                    // Verify base64 encoding
                    body: Buffer.from(JSON.stringify(payload)).toString('base64'),
                    oidcToken: {
                        serviceAccountEmail: config.serviceAccountEmail,
                    },
                }),
                // Verify time conversion to seconds
                scheduleTime: {
                    seconds: Math.floor(scheduledTime.getTime() / 1000),
                },
            }),
        })

        expect(taskName).toBe('tasks/my-task-id')
    })

    it('should ignore ALREADY_EXISTS error and return task name during scheduling', async () => {
        mockClientInstance.createTask.mockRejectedValue({ code: 6 }) // ALREADY_EXISTS

        const scheduledTime = new Date('2026-01-20T14:00:00Z')
        const taskName = await adapter.scheduleNotificationTask('id-1', scheduledTime, {})

        expect(taskName).toBe(`projects/test/locations/loc/queues/q/tasks/id-1-${scheduledTime.getTime()}`)
    })

    it('should return empty string if response has no name', async () => {
        mockClientInstance.createTask.mockResolvedValue([{}])

        const taskName = await adapter.scheduleNotificationTask('id', new Date(), {})

        expect(taskName).toBe('')
    })

    describe('cancelNotificationTask', () => {
        it('should call deleteTask with the deterministic task name', async () => {
            mockClientInstance.deleteTask = jest.fn().mockResolvedValue(undefined)

            const scheduledTime = new Date('2026-01-20T14:00:00Z')
            await adapter.cancelNotificationTask('rem-123', scheduledTime)

            expect(mockClientInstance.deleteTask).toHaveBeenCalledWith({
                name: `projects/test/locations/loc/queues/q/tasks/rem-123-${scheduledTime.getTime()}`,
            })
        })

        it('should ignore NOT_FOUND error during cancellation', async () => {
            mockClientInstance.deleteTask = jest.fn().mockRejectedValue({ code: 5 }) // NOT_FOUND

            await expect(adapter.cancelNotificationTask('rem-123', new Date())).resolves.not.toThrow()
        })

        it('should throw other errors during cancellation', async () => {
            const error = new Error('Other error')
            mockClientInstance.deleteTask = jest.fn().mockRejectedValue(error)

            await expect(adapter.cancelNotificationTask('rem-123', new Date())).rejects.toThrow('Other error')
        })
    })
})
