"use client";

import { OrganizationList, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Onboarding() {
  const { organization } = useOrganization();
  const { setActive, isLoaded, organizationList } = useOrganizationList();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Check if user came here specifically to create a new organization
  const forceNew = searchParams.get('create') === 'new';

  useEffect(() => {
    // Only auto-redirect if:
    // 1. We have an organization
    // 2. User is not forcing creation of a new org
    // 3. We haven't already redirected
    // 4. User doesn't have any organizations yet (first time setup)
    if (organization && !forceNew && !hasRedirected && organizationList?.length === 1) {
      console.log("Auto-redirecting to existing organization:", organization.slug);
      setHasRedirected(true);
      setActive({ organization: organization.id })
        .then(() => {
          console.log("Organization set as active, navigating...");
          router.push(`/organization/${organization.slug}`);
        })
        .catch((error) => {
          console.error("Failed to set organization as active:", error);
        });
    }
  }, [organization, isLoaded, forceNew, hasRedirected, organizationList, setActive, router]);

  return (
    <div className="flex flex-col justify-center items-center pt-14">
      {/* Show message if user has existing organizations */}
      {isLoaded && organizationList && organizationList.length > 0 && !forceNew && (
        <div className="mb-6 text-center">
          <p className="text-lg mb-4">You already belong to {organizationList.length} organization(s).</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                const firstOrg = organizationList[0].organization;
                setActive({ organization: firstOrg.id }).then(() => {
                  router.push(`/organization/${firstOrg.slug}`);
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to {organizationList[0].organization.name}
            </button>
            <button
              onClick={() => {
                // Don't redirect, let user create new org
                setHasRedirected(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create New Organization
            </button>
          </div>
        </div>
      )}
      
      {/* Show organization list if user chose to create new or has no orgs */}
      {(isLoaded && (organizationList?.length === 0 || hasRedirected || forceNew)) && (
        <OrganizationList
          hidePersonal
          afterCreateOrganizationUrl="/organization/:slug"
          afterSelectOrganizationUrl="/organization/:slug"
          skipInvitationScreen={false}
        />
      )}
    </div>
  );
}
