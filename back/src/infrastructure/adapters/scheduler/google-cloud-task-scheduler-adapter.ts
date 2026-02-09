import { CloudTasksClient } from '@google-cloud/tasks'
import { TaskSchedulerPort } from '../../../domain/gateway/scheduler/task-scheduler-port'

export class GoogleCloudTaskSchedulerAdapter implements TaskSchedulerPort {
    private client = new CloudTasksClient()

    constructor(
        private project: string,
        private location: string,
        private queue: string,
        private targetUrl: string,
        private serviceAccountEmail: string
    ) { }

    async scheduleNotificationTask(reminderId: string, scheduledTime: Date, payload: any): Promise<string> {
        const queuePath = this.client.queuePath(this.project, this.location, this.queue)

        const task = {
            name: `${queuePath}/tasks/${reminderId}`,
            httpRequest: {
                httpMethod: 'POST' as const,
                url: this.targetUrl,
                headers: { 'Content-Type': 'application/json' },
                body: Buffer.from(JSON.stringify(payload)).toString('base64'),
                oidcToken: {
                    serviceAccountEmail: this.serviceAccountEmail,
                },
            },
            scheduleTime: { seconds: Math.floor(scheduledTime.getTime() / 1000) },
        }

        try {
            const [response] = await this.client.createTask({ parent: queuePath, task })
            return response.name || ''
        } catch (error: any) {
            // If task already exists, we ignore it as we use deterministic IDs
            if (error.code === 6) { // ALREADY_EXISTS
                return `${queuePath}/tasks/${reminderId}`
            }
            throw error
        }
    }

    async cancelNotificationTask(reminderId: string): Promise<void> {
        const queuePath = this.client.queuePath(this.project, this.location, this.queue)
        const taskName = `${queuePath}/tasks/${reminderId}`

        try {
            await this.client.deleteTask({ name: taskName })
        } catch (error: any) {
            // If task doesn't exist, it might have already run or been deleted, so we ignore 404
            if (error.code === 5) { // NOT_FOUND
                return
            }
            throw error
        }
    }
}
