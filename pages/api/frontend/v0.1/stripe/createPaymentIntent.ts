import { StatusCodes } from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: "2022-11-15" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    //const { productId } = req.body;
  
    // TODO: lookup the price of the product in the database

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000,
      currency: 'eur',
      automatic_payment_methods: { enabled: true }
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } else {
    res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
  }
}
