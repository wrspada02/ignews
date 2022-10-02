import { fauna } from "../../../services/fauna";
import { query as q } from "faunadb";
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction = false,
) {
    const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    )
    console.log('userRef', userRef);
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log('subscription', subscription);

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        priceId: subscription.items.data[0].price.id,
    }

    console.log(subscriptionData);

    if(createAction) {
        console.log('Criando a bosta de uma subscription');
        await fauna.query(
            q.Create(
                q.Collection('subscriptions'),
                { data : subscriptionData }
            )
        );
    } else {
        console.log('Atualizando a bosta de uma subscription');
        await fauna.query(
            q.Replace(
                q.Select(
                    "ref",
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscriptionId,
                        )
                    )
                ),
                { data : subscriptionData }
            )
        )
    }
}