export interface NotificationGateway {
    sendMedicationReminder(token: string, medName: string, medicationId: string, quantity: string, reminderId: string): Promise<void>
    sendLowStockNotification(token: string, medName: string, quantity: number): Promise<void>
}
