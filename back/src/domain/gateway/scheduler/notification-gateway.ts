export interface NotificationGateway {
    sendMedicationReminder(token: string, medName: string, quantity: string, reminderId: string): Promise<void>
}
