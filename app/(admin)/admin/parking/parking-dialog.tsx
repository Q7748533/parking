"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createParkingProvider, updateParkingProvider, getAirports, ParkingFormData, ParkingProvider } from "./actions";
import { parseParkingJson, summarizeReviews } from "./ai-parse";

interface ParkingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ParkingProvider | null;
  onSuccess: () => void;
}

const defaultFormData: ParkingFormData = {
  name: "",
  airportId: "",
  type: "shuttle",
  pricePerDay: 0,
  distance: "",
  features: "",
  affiliateUrl: "",
  description: "",
  addressLine1: "",
  city: "",
  stateCode: "",
  zipCode: "",
  latitude: "",
  longitude: "",
  shuttleService: false,
  shuttleFrequency: "",
  shuttleDescription: "",
  cancellationPolicy: "",
  parkingAccess: "",
  customMessage: "",
  rating: 0,
  ratingCount: 0,
  recommendationPercentage: 0,
  contactPhone: "",
  locationType: "",
  strikeOffPrice: 0,
  discountPercentage: 0,
  operatingHours: "",
  amenities: "",
  reviewSummary: "",
  beenHereCount: 0,
  shuttleReccPercentage: 0,
  freeCancelAvailable: false,
  reviewAiSummary: "",
};

export function ParkingDialog({ open, onOpenChange, provider, onSuccess }: ParkingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [airports, setAirports] = useState<{ id: string; code: string; name: string }[]>([]);
  const [formData, setFormData] = useState<ParkingFormData>(defaultFormData);
  const [jsonInput, setJsonInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [parseResult, setParseResult] = useState<"idle" | "ai_success" | "ai_fallback">("idle");
  const [reviewsInput, setReviewsInput] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [reviewSummary, setReviewSummary] = useState("");
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    if (open) {
      loadAirports();
      if (provider) {
        setFormData({
          name: provider.name,
          airportId: provider.airportId,
          type: provider.type,
          pricePerDay: provider.pricePerDay,
          distance: provider.distance,
          features: provider.features,
          affiliateUrl: provider.affiliateUrl,
          description: provider.description,
          addressLine1: provider.addressLine1,
          city: provider.city,
          stateCode: provider.stateCode,
          zipCode: provider.zipCode,
          latitude: provider.latitude,
          longitude: provider.longitude,
          shuttleService: provider.shuttleService,
          shuttleFrequency: provider.shuttleFrequency,
          shuttleDescription: provider.shuttleDescription,
          cancellationPolicy: provider.cancellationPolicy,
          parkingAccess: provider.parkingAccess,
          customMessage: provider.customMessage,
          rating: provider.rating,
          ratingCount: provider.ratingCount,
          recommendationPercentage: provider.recommendationPercentage,
          contactPhone: provider.contactPhone,
          locationType: provider.locationType,
          strikeOffPrice: provider.strikeOffPrice,
          discountPercentage: provider.discountPercentage,
          operatingHours: provider.operatingHours,
          amenities: provider.amenities,
          reviewSummary: provider.reviewSummary,
          beenHereCount: provider.beenHereCount,
          shuttleReccPercentage: provider.shuttleReccPercentage,
          freeCancelAvailable: provider.freeCancelAvailable,
          reviewAiSummary: provider.reviewAiSummary,
        });
        setReviewSummary(provider.reviewAiSummary || "");
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [open, provider]);

  const loadAirports = async () => {
    const result = await getAirports();
    if (result.success && result.data) {
      setAirports(result.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert("Provider Name is required");
      setActiveTab("basic");
      return;
    }
    if (!formData.airportId) {
      alert("Please select an Airport");
      setActiveTab("basic");
      return;
    }
    
    setIsLoading(true);

    const result = provider
      ? await updateParkingProvider(provider.id, formData)
      : await createParkingProvider(formData);

    if (result.success) {
      onSuccess();
    } else {
      alert(result.error || "Failed to save parking provider");
    }

    setIsLoading(false);
  };

  const updateField = (field: keyof ParkingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleParseJson = async () => {
    if (!jsonInput.trim()) {
      setParseError("Please paste JSON data first");
      return;
    }

    setIsParsing(true);
    setParseError("");
    setParseResult("idle");

    const result = await parseParkingJson(jsonInput);

    if (result.success && result.data) {
      setFormData((prev) => ({
        ...result.data!,
        airportId: prev.airportId || result.data!.airportId,
      }));
      setActiveTab("basic");

      if (result.aiGenerated) {
        setParseResult("ai_success");
        setParseError("");
      } else {
        setParseResult("ai_fallback");
        setParseError("AI did not generate content — using extracted data only. You can fill in the description, features, and other content fields manually.");
      }
    } else {
      setParseError(result.error || "Failed to parse JSON");
      setParseResult("idle");
    }

    setIsParsing(false);
  };

  const handleSummarizeReviews = async () => {
    if (!reviewsInput.trim()) {
      setSummaryError("Please paste review text first");
      return;
    }
    setIsSummarizing(true);
    setSummaryError("");
    const result = await summarizeReviews(reviewsInput, formData.name || "this provider");
    if (result.success && result.summary) {
      setReviewSummary(result.summary);
      setFormData((prev) => ({ ...prev, reviewAiSummary: result.summary! }));
    } else {
      setSummaryError(result.error || "Failed to summarize");
    }
    setIsSummarizing(false);
  };

  // Check if airport was auto-matched
  const airportAutoMatched = formData.airportId && airports.some((a) => a.id === formData.airportId);

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "location", label: "Location" },
    { id: "details", label: "Details" },
    { id: "pricing", label: "Pricing" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{provider ? "Edit" : "Add"} Parking Provider</DialogTitle>
          <DialogDescription>
            {provider ? "Update the parking provider details." : "Add a new parking provider for an airport."}
          </DialogDescription>
        </DialogHeader>

        {/* AI JSON Parse Section */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Auto-fill from JSON (AI Powered)</h3>
          <p className="text-xs text-blue-700 mb-3">
            Paste raw JSON data and click "Parse with AI" to auto-fill all fields. AI generates description, features, and policies.
          </p>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste JSON here... e.g. {"listingName": "...", "listingDesc": "..."}'
            className="w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-sm min-h-[100px] font-mono text-xs mb-2"
          />
          {parseResult === "ai_success" && (
            <p className="text-xs text-green-700 mb-2 flex items-center gap-1">
              <span className="inline-block w-3.5 h-3.5 rounded-full bg-green-500 text-white text-[10px] leading-3.5 text-center">✓</span>
              AI content generated — description, features, and policies filled in.
            </p>
          )}
          {parseResult === "ai_fallback" && (
            <p className="text-xs text-amber-700 mb-2">{parseError}</p>
          )}
          {parseResult === "idle" && parseError && (
            <p className="text-xs text-red-600 mb-2">{parseError}</p>
          )}
          <Button
            type="button"
            onClick={handleParseJson}
            disabled={isParsing}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            {isParsing ? "Parsing..." : "Parse with AI"}
          </Button>
        </div>

        {/* AI Review Summary Section */}
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">AI Review Summary (&quot;What Travelers Say&quot;)</h3>
          <p className="text-xs text-purple-700 mb-3">
            Paste traveler reviews below and click &quot;Summarize with AI&quot; to generate a natural summary for the detail page.
          </p>
          <textarea
            value={reviewsInput}
            onChange={(e) => setReviewsInput(e.target.value)}
            placeholder="Paste review texts here... Each review on a new line.
e.g.
Great parking, shuttle was fast and the staff was friendly.
Easy to find, competitive pricing and clean facility.
..."
            className="w-full rounded-md border border-purple-300 bg-white px-3 py-2 text-sm min-h-[100px] font-mono text-xs mb-2"
          />
          {summaryError && (
            <p className="text-xs text-red-600 mb-2">{summaryError}</p>
          )}
          {reviewSummary && (
            <div className="bg-white rounded-md border border-purple-200 p-3 mb-2">
              <p className="text-xs text-purple-500 mb-1 font-medium">AI Summary:</p>
              <p className="text-sm text-gray-800 leading-relaxed">{reviewSummary}</p>
            </div>
          )}
          <Button
            type="button"
            onClick={handleSummarizeReviews}
            disabled={isSummarizing}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
          >
            {isSummarizing ? "Summarizing..." : "Summarize with AI"}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-200 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#6366f1] text-[#6366f1]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Provider Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g., WallyPark"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="airport">Airport *</Label>
                {airportAutoMatched && parseResult === "ai_success" && (
                  <p className="text-xs text-green-600">Auto-matched from airportCode in JSON data</p>
                )}
                <select
                  id="airport"
                  value={formData.airportId}
                  onChange={(e) => updateField("airportId", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select an airport</option>
                  {airports.map((airport) => (
                    <option key={airport.id} value={airport.id}>
                      {airport.code} - {airport.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Parking Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="shuttle">Shuttle</option>
                  <option value="valet">Valet</option>
                  <option value="outdoor valet">Outdoor Valet</option>
                  <option value="indoor valet">Indoor Valet</option>
                  <option value="covered valet">Covered Valet</option>
                  <option value="self">Self Parking</option>
                  <option value="outdoor self">Outdoor Self</option>
                  <option value="outdoor self park">Outdoor Self Park</option>
                  <option value="indoor self park">Indoor Self Park</option>
                  <option value="covered self park">Covered Self Park</option>
                  <option value="covered self">Covered Self</option>
                  <option value="covered">Covered</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="indoor">Indoor</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Parking lot description..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="features">Features</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => updateField("features", e.target.value)}
                  placeholder="e.g., Free shuttle, 24/7 security"
                />
              </div>
            </div>
          )}

          {/* Location Tab */}
          {activeTab === "location" && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Address Line 1</Label>
                <Input
                  id="address"
                  value={formData.addressLine1 || ""}
                  onChange={(e) => updateField("addressLine1", e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State Code</Label>
                  <Input
                    id="state"
                    value={formData.stateCode || ""}
                    onChange={(e) => updateField("stateCode", e.target.value)}
                    placeholder="NY"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zipCode || ""}
                  onChange={(e) => updateField("zipCode", e.target.value)}
                  placeholder="11420"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    value={formData.latitude || ""}
                    onChange={(e) => updateField("latitude", e.target.value)}
                    placeholder="40.6632845"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lon">Longitude</Label>
                  <Input
                    id="lon"
                    value={formData.longitude || ""}
                    onChange={(e) => updateField("longitude", e.target.value)}
                    placeholder="-73.8128878"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="distance">Distance to Airport (miles) *</Label>
                <Input
                  id="distance"
                  value={formData.distance}
                  onChange={(e) => updateField("distance", e.target.value)}
                  placeholder="0.8"
                  required
                />
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.shuttleService || false}
                    onChange={(e) => updateField("shuttleService", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Shuttle Service Available
                </Label>
              </div>
              {formData.shuttleService && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="shuttleFreq">Shuttle Frequency</Label>
                    <Input
                      id="shuttleFreq"
                      value={formData.shuttleFrequency || ""}
                      onChange={(e) => updateField("shuttleFrequency", e.target.value)}
                      placeholder="Free Shuttle available"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="shuttleDesc">Shuttle Description</Label>
                    <Input
                      id="shuttleDesc"
                      value={formData.shuttleDescription || ""}
                      onChange={(e) => updateField("shuttleDescription", e.target.value)}
                      placeholder="Free shuttle service to and from the airport terminals..."
                    />
                  </div>
                </>
              )}
              <div className="grid gap-2">
                <Label htmlFor="cancellation">Cancellation Policy</Label>
                <textarea
                  id="cancellation"
                  value={formData.cancellationPolicy || ""}
                  onChange={(e) => updateField("cancellationPolicy", e.target.value)}
                  placeholder="Flexible. You can cancel..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="access">Parking Access Info</Label>
                <textarea
                  id="access"
                  value={formData.parkingAccess || ""}
                  onChange={(e) => updateField("parkingAccess", e.target.value)}
                  placeholder="This facility is open 24/7..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customMsg">Custom Message</Label>
                <textarea
                  id="customMsg"
                  value={formData.customMessage || ""}
                  onChange={(e) => updateField("customMessage", e.target.value)}
                  placeholder="Important notes for customers..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Phone</Label>
                <Input
                  id="contact"
                  value={formData.contactPhone || ""}
                  onChange={(e) => updateField("contactPhone", e.target.value)}
                  placeholder="+1 7184806663"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="locationType">Location Type</Label>
                <Input
                  id="locationType"
                  value={formData.locationType || ""}
                  onChange={(e) => updateField("locationType", e.target.value)}
                  placeholder="Commercial Parking Lot or Garage"
                />
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price Per Day ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.pricePerDay}
                    onChange={(e) => updateField("pricePerDay", parseFloat(e.target.value))}
                    placeholder="17.73"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="strikePrice">Strike-off Price ($)</Label>
                  <Input
                    id="strikePrice"
                    type="number"
                    step="0.01"
                    value={formData.strikeOffPrice || ""}
                    onChange={(e) => updateField("strikeOffPrice", parseFloat(e.target.value) || 0)}
                    placeholder="19.70"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount Percentage (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={formData.discountPercentage || ""}
                  onChange={(e) => updateField("discountPercentage", parseFloat(e.target.value) || 0)}
                  placeholder="10"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating || ""}
                    onChange={(e) => updateField("rating", parseFloat(e.target.value) || 0)}
                    placeholder="5.0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ratingCount">Rating Count</Label>
                  <Input
                    id="ratingCount"
                    type="number"
                    value={formData.ratingCount || ""}
                    onChange={(e) => updateField("ratingCount", parseInt(e.target.value) || 0)}
                    placeholder="692"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recommend">Recommendation %</Label>
                  <Input
                    id="recommend"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.recommendationPercentage || ""}
                    onChange={(e) => updateField("recommendationPercentage", parseInt(e.target.value) || 0)}
                    placeholder="84"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="affiliate">Booking URL</Label>
                <Input
                  id="affiliate"
                  type="url"
                  value={formData.affiliateUrl}
                  onChange={(e) => updateField("affiliateUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amenities">Amenities (JSON)</Label>
                <textarea
                  id="amenities"
                  value={formData.amenities || ""}
                  onChange={(e) => updateField("amenities", e.target.value)}
                  placeholder='[{"amenityName":"Free Shuttle"}, ...]'
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] font-mono text-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hours">Operating Hours (JSON)</Label>
                <textarea
                  id="hours"
                  value={formData.operatingHours || ""}
                  onChange={(e) => updateField("operatingHours", e.target.value)}
                  placeholder='[{"day":"Sunday","operatingHours":[{"from":"00:00:00","to":"23:59:00"}]}]'
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] font-mono text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : provider ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
