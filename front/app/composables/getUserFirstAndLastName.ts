export const getUserFirstAndLastName = (str: string) => {
    if (str) {
        const [firstName = '', lastName = ''] = str.split(' ')
        return firstName ? `${firstName[0]!.toUpperCase()}. ${lastName}` : str
    } else return str
}
