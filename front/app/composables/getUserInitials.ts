export const getUserInitials = (str?: string) => {
    if (str) {
        const [firstName = '', lastName = ''] = str.split(' ')
        return (firstName[0] ?? '') + (lastName[0] ?? '')
    }
}
