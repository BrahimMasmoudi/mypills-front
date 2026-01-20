import { CloudTasksClient } from '@google-cloud/tasks'
import { TaskSchedulerPort } from '../../../domain/gateway/reminder/task-scheduler-port'

export class GoogleCloudTaskSchedulerAdapter implements TaskSchedulerPort {
    private client = new CloudTasksClient()

    constructor(
        private project: string,
        private location: string,
        private queue: string,
        private targetUrl: string,
        private serviceAccountEmail: string
    ) {}

    async scheduleNotificationTask(reminderId: string, scheduledTime: Date, payload: any): Promise<string> {
        const queuePath = this.client.queuePath(this.project, this.location, this.queue)

        const task = {
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

        const [response] = await this.client.createTask({ parent: queuePath, task })
        return response.name || ''
    }
}
