import {formatDistance} from "date-fns";
import DateFnsAdapter from "@date-io/date-fns";
import {useI18n} from "vue-i18n";
import {enGB, fr} from 'date-fns/locale'

export const parseDate = (date: { _seconds: string, _nanoseconds: string } | Date) => {
    const {locale} = useI18n()
    if (date._seconds)
        return formatDistance(new Date(date._seconds * 1000), new Date(), {
            addSuffix: true,
            locale: locale.value === 'fr' ? fr : enGB
        })
    else {
        return formatDistance(date, new Date(), {addSuffix: true, locale: locale.value === 'fr' ? fr : enGB})
    }
}


export const parseSelectedDate = (date: Date) => {
    const dateFns = new DateFnsAdapter()
    const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    const formattedDate = new Date(utcDate)
    return dateFns.parseISO(formattedDate.toISOString())
}