interface OrgSchemaProps {
  airportCount?: number;
}

export function OrganizationSchema({ airportCount }: OrgSchemaProps) {
  const coverage = airportCount && airportCount > 0 ? `${airportCount}+ US airports` : "US airports";

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AirportMatrix",
    url: "https://airportmatrix.com",
    description: `Compare airport parking prices and find deals at ${coverage}`,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://airportmatrix.com/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AirportMatrix",
    url: "https://airportmatrix.com",
    description: `Leading airport parking comparison platform helping travelers save up to 60% on parking at ${coverage}.`,
    foundingDate: "2025",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@airportmatrix.com",
      contactType: "customer service",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
    </>
  );
}
