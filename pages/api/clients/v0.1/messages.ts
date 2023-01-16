// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

type ResponseDto = {
    id: number,
    blocking: boolean,
    title: string,
    body: string
}


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseDto[]>
) {
    console.log('url is ', req.url)
    switch (req.method) {
        case 'GET':
            const allMessages = await prisma.message.findMany({
                where: {
                    AND: [
                        {
                            startDate: {
                                lte: new Date()
                            },
                        },
                        {
                            endDate: {
                                gte: new Date()
                            }
                        }
                    ]
                }
            })

            res.status(200).json(allMessages.map((message): ResponseDto => {
                return {
                    id: message.id,
                    blocking: message.blocking,
                    title: message.title,
                    body: message.body
                }
            }))
            break

        default:
            res.status(405).end('method not allowed')
            break
    }
}
