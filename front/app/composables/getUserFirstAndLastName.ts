export const getUserFirstAndLastName = (str: string) => {
    if (str) {
        const [firstName, lastName] = str.split(' ')
        return `${firstName[0].toUpperCase()}. ${lastName}`
    } else return str
}