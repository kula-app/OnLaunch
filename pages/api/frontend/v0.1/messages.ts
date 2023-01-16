// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

type ResponseDto = {
    id: number,
    blocking: boolean,
    title: string,
    body: string,
    startDate: Date,
    endDate: Date

}


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseDto[]>
) {
    console.log('url is ', req.url)
    switch (req.method) {
        case 'GET':
            const allMessages = await prisma.message.findMany()

            res.status(200).json(allMessages)
            break

        default:
            res.status(405).end('method not allowed')
            break
    }
}
