import { NextRequest, NextResponse } from "next/server"
import bufferFrom from "buffer-from"
import { translate } from "@/lib/translate"

const process = async (req: NextRequest) => {
    try {
        const data = await req.formData()

        const file = data.get("file") as File

        const bytes = await file.arrayBuffer()
        const buffer = bufferFrom(bytes)

        const input = buffer.toString("utf-8") as string
        const output = await translate(input)

        return NextResponse.json({ data: output, error: null })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function OPTIONS(req: NextRequest) {
    return process(req)
}

export async function POST(req: NextRequest) {
    return process(req)
}