import { type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const name = body.name;
    const email = body.email;
    const phone = body.phone;
    const paymentMethod = body.paymentMethod;
    if (!name || !email || !phone || !paymentMethod) {
        return Response.json({ message: 'Please fill out all required fields' }, { status: 400 });
    }
    // EXTRA CHECKS + EMAIL DOESN'T EXIST IN DB
    // DATA BASE SAVE LOGIC
    return Response.json({ message: `Ticket submitted successfully for ${name} / ${email}` });
}