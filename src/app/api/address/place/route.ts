import { NextRequest, NextResponse } from "next/server";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_DETAILS_API_URL = "https://maps.googleapis.com/maps/api/place/details/json";

interface AddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}

function findAddressComponent(components: AddressComponent[], type: string): string {
	return components.find(component => component.types.includes(type))?.long_name || "";
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const placeId = searchParams.get("placeId");

		if (!placeId) {
			return NextResponse.json(
				{ data: null, error: "Place ID is required" },
				{ status: 400 }
			);
		}

		if (!GOOGLE_PLACES_API_KEY) {
			return NextResponse.json(
				{ data: null, error: "Google Places API key is not configured" },
				{ status: 500 }
			);
		}

		const response = await fetch(
			`${PLACE_DETAILS_API_URL}?place_id=${placeId}&fields=formatted_address,adr_address,address_components,geometry&key=${GOOGLE_PLACES_API_KEY}`
		);

		if (!response.ok) {
			throw new Error(`Google Places API error: ${response.statusText}`);
		}

		const data = await response.json();

		if (data.status !== "OK") {
			throw new Error(`Google Places API error: ${data.status}`);
		}

		const result = data.result;
		const components = result.address_components || [];

		// Extract address components
		const streetNumber = findAddressComponent(components, "street_number");
		const route = findAddressComponent(components, "route");
		const subpremise = findAddressComponent(components, "subpremise");

		// Construct address1 with unit/suite if available
		const address1 = subpremise
			? `${subpremise}/${streetNumber} ${route}`
			: `${streetNumber} ${route}`.trim();

		// Find additional address components
		const city = findAddressComponent(components, "locality") ||
			findAddressComponent(components, "administrative_area_level_2");
		const region = findAddressComponent(components, "administrative_area_level_1");
		const postalCode = findAddressComponent(components, "postal_code");
		const country = findAddressComponent(components, "country");

		return NextResponse.json({
			data: {
				address: {
					address1,
					address2: "", // Optional secondary address line
					formattedAddress: result.formatted_address,
					city,
					region,
					postalCode,
					country,
					lat: result.geometry?.location?.lat || 0,
					lng: result.geometry?.location?.lng || 0,
				},
				adrAddress: result.adr_address,
			},
			error: null,
		});
	} catch (error) {
		console.error("Place Details API Error:", error);
		return NextResponse.json(
			{ data: null, error: "Failed to fetch place details" },
			{ status: 500 }
		);
	}
}
