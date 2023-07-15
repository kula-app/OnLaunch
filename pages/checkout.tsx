import React, { FC, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadConfig } from '../config/loadConfig';

// Load the Stripe.js library
const config = loadConfig();
const stripePromise = loadStripe(config.stripeConfig.publishableKey);

const SubscriptionPage: FC = () => {
    
    return (
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    );
  }
  
  const CheckoutForm: FC = () => {
    const stripe = useStripe();
    const elements = useElements();
  
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
  
      if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
      }
  
      const cardElement = elements.getElement(CardElement);
  
      const {error, paymentMethod} = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement!,
      });
  
      // Handle errors here
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button type="submit" disabled={!stripe}>Subscribe</button>
      </form>
    );
  }
  
  export default SubscriptionPage;