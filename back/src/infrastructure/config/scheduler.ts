import { GoogleCloudTaskSchedulerAdapter } from '../adapters/scheduler/google-cloud-task-scheduler-adapter'

export const createSchedulerAdapter = () => {
    const project = process.env.GCLOUD_PROJECT!
    const location = 'europe-west3'
    const queue = 'reminder'

    return new GoogleCloudTaskSchedulerAdapter(
        project,
        location,
        queue,
        `https://${location}-${project}.cloudfunctions.net/sendFCMNotification`,
        `${project}@appspot.gserviceaccount.com`
    )
}
