import { NextResponse } from "next/server";
// import OpenAI from "openai"; // <-- uncomment when wiring your key

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { Data, Reference, Prompt } = payload || {};

    if (!Data || !Reference || !Prompt) {
      return NextResponse.json(
        { error: "Missing Data, Reference, or Prompt" },
        { status: 400 }
      );
    }

    // TODO: call OpenAI here with your Prompt + Data + Reference as separate messages
    // For now, return a mocked shape to verify UI + logic:

    const mocked = {
      topics: [
        {
          topic: "Company Overview",
          subtopics: [
            { name: "Name", value: "Aurora Foods Inc." },
            { name: "Location", value: "Portland; regional sourcing within a few hours' drive" },
            { name: "Founding Year", value: "2018" },
            { name: "Mission / Why We Exist", value: "Connect small producers and customers; fair pay; freshness; fewer middlemen." }
          ]
        },
        {
          topic: "Products & Services",
          subtopics: [
            { name: "What We Sell", value: "Seasonal produce; bread, cheese, jam; ready-to-eat meals; weekly subscription boxes; bulk orders for restaurants/cafes." },
            { name: "Target Customers", value: "Grocery stores, restaurants, and consumers via subscriptions/online." },
            { name: "Value Proposition", value: "Freshness via cold-chain, trusted local network (~200+ suppliers), quality and honesty, data-driven inventory." }
          ]
        },
        {
          topic: "Business Model",
          subtopics: [
            { name: "How We Operate", value: "Source from small producers; cold-chain logistics; minimal middlemen." },
            { name: "Distribution Channels", value: "B2B (grocers, restaurants); B2C (subscriptions/online orders)." }
          ]
        },
        {
          topic: "Market & Growth",
          subtopics: [
            { name: "Current Performance", value: "$15M revenue last year; ~38% margins." },
            { name: "Growth Metrics", value: "22% CAGR since inception." },
            { name: "Future Plans", value: "Expand to NorCal & Vancouver; scale online; add plant-based/functional drinks; chef collaborations." }
          ]
        },
        {
          topic: "Team",
          subtopics: [
            { name: "Key People", value: "Sarah (CEO), Luis (COO), Maya (Product)." },
            { name: "Roles", value: "Sarah—ex national grocery ops; Luis—cold-chain expert; Maya—ex Michelin kitchens for product curation." }
          ]
        }
      ]
    };

    return NextResponse.json(mocked, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
