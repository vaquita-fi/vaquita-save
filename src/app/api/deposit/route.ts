import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Deposit } from "@/types/Goal";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("vaquita");

    const deposits = await db.collection<Deposit>("deposits").find().toArray();
    return NextResponse.json({ success: true, deposits });
  } catch (error) {
    console.error("[GET_DEPOSITS_ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { address, amount, depositId } = await req.json();

    if (!address || !amount || !depositId) {
      return NextResponse.json(
        { success: false, error: "Address, amount, and depositId are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vaquita");

    const newDeposit: Deposit = {
      depositId,
      address,
      amount,
      timestamp: new Date(),
      withdrawn: false,
    };

    await db.collection("deposits").insertOne(newDeposit);

    console.log(`[DEPOSIT] New deposit added for address ${address}`);

    return NextResponse.json({ success: true, deposit: newDeposit });
  } catch (error) {
    console.error("[POST_DEPOSIT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
