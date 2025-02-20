import { NextResponse } from "next/server";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const AUTOCOMPLETE_API_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("query");

		if (!query) {
			return NextResponse.json(
				{ data: [], error: "Search query is required" },
				{ status: 400 }
			);
		}

		if (!GOOGLE_PLACES_API_KEY) {
			return NextResponse.json(
				{ data: [], error: "Google Places API key is not configured" },
				{ status: 500 }
			);
		}

		const response = await fetch(
			`${AUTOCOMPLETE_API_URL}?input=${encodeURIComponent(
				query
			)}&types=address&key=${GOOGLE_PLACES_API_KEY}`
		);

		if (!response.ok) {
			throw new Error(`Google Places API error: ${response.statusText}`);
		}

		const data = await response.json();

		if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
			throw new Error(`Google Places API error: ${data.status}`);
		}

		// Transform the response to match our expected format
		const predictions = data.predictions || [];
		const transformedData = predictions.map((prediction: any) => ({
			placeId: prediction.place_id,
			mainText: prediction.structured_formatting.main_text,
			secondaryText: prediction.structured_formatting.secondary_text,
		}));

		return NextResponse.json({ data: transformedData, error: null });
	} catch (error) {
		console.error("Autocomplete API Error:", error);
		return NextResponse.json(
			{ data: [], error: "Failed to fetch address suggestions" },
			{ status: 500 }
		);
	}
}
