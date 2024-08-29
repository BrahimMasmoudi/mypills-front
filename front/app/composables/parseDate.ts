import {formatDistance} from "date-fns";
import {useI18n} from "vue-i18n";
import { enGB, fr } from 'date-fns/locale'

export const parseDate = (date: { _seconds: string, _nanoseconds: string }) => {
    const {locale}= useI18n()
    return formatDistance(new Date(date._seconds * 1000), new Date(), {addSuffix: true, locale: locale.value === 'fr' ? fr : enGB})
}