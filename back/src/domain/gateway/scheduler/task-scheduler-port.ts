export interface TaskSchedulerPort {
    scheduleNotificationTask(
        reminderId: string,
        scheduledTime: Date,
        payload: { userId: string, medName: string, medicationId: string, quantity: string, reminderId: string }
    ): Promise<string>
    cancelNotificationTask(reminderId: string, scheduledTime: Date): Promise<void>
}
