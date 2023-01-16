// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  //const allMessages = await prisma.message.findMany()
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
  console.log(allMessages)
  res.status(200).json(allMessages)
  //res.status(200).json(allMessages.json())
}
