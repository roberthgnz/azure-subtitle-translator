import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
// @ts-ignore
import { parse, compile } from 'node-webvtt'

const API_URL = 'https://api.cognitive.microsofttranslator.com'

type Cue = {
    identifier: string,
    start: number,
    end: number,
    text: string
    styles: string
}

type Translation = {
    text: string
    to: string
}

type TranslationResult = {
    translations: Translation[]
}

const translator = async ({ cues, from, to }: {
    cues: Cue[]
    from: string
    to: string
}) => {
    try {
        const params = new URLSearchParams()

        params.append('api-version', '3.0')
        params.append('from', from)
        params.append('to', to)

        const { data } = await axios<TranslationResult[]>({
            baseURL: API_URL,
            url: '/translate',
            method: 'POST',
            headers: {
                'Ocp-Apim-cuescription-Key': process.env.AZURE_TRANSLATE_KEY,
                'Ocp-Apim-cuescription-Region': process.env.AZURE_TRANSLATE_REGION,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            },
            params,
            data: cues.map(cue => ({ text: cue.text })),
            responseType: 'json'
        })

        console.log(data)

        const normalize = (sub: TranslationResult, index: number) => ({
            ...cues[index],
            text: sub.translations[0].text
        } as Cue)

        return data.map(normalize)
    } catch (error: any) {
        console.error(error)
        const message = error?.response?.data?.error ?? error?.message ?? 'Unknown error'
        throw new Error('TRANSLATOR_ERROR: ' + message)
    }
}

const srtToVtt = (srt: string) => {
    let result = 'WEBVTT\n\n'
    result += srt.replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2')
    return result
}

export const translate = async (text: string) => {
    const input = srtToVtt(text)
    const cues = parse(input, { strict: false }).cues as Cue[]

    const result = []

    const transform = async (cues: Cue[]) => {
        try {
            const translated = await translator({
                cues,
                from: 'en',
                to: 'es'
            })

            return translated
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    for (let i = 0; i < cues.length; i += 500) {
        const _cues = cues.slice(i, i + 500)

        const translated = await transform(_cues)

        if (!translated) return null

        result.push(...translated)
    }

    const vttOptions = {
        meta: {
            Kind: 'captions',
            Language: 'es'
        },
        cues: result,
        valid: true
    }

    return compile(vttOptions)
}
