import { ModeToggle } from "@/components/toggle-theme";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Github } from "lucide-react";
import Link from "next/link";
import { AutocompleteComponent } from "@/components/autocomplete";

export default async function Home() {
	return (
		<main className="min-h-screen w-screen flex flex-col items-center justify-center space-y-2 max-w-4xl mx-auto px-6">
			<h1 className="text-4xl font-bold text-center">
				Address Autocomplete
			</h1>
			<p className="text-center text-secondary-foreground">
				An address autocomplete component using Google Places API and shadcn
				components.
			</p>
			<div className="w-full md:w-1/2 pt-7 space-y-1">
				<Label htmlFor="address">Address</Label>
				<AutocompleteComponent />

			</div>
		</main>
	);
}
