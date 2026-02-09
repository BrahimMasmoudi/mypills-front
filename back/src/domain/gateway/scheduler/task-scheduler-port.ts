export interface TaskSchedulerPort {
    scheduleNotificationTask(
        reminderId: string,
        scheduledTime: Date,
        payload: { userId: string, medName: string, quantity: string }
    ): Promise<string>
    cancelNotificationTask(reminderId: string): Promise<void>
}
