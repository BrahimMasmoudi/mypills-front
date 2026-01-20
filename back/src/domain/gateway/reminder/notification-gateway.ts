export interface NotificationGateway {
    sendMedicationReminder(token: string, medName: string, quantity: string): Promise<void>
}
