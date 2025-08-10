"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useOrganizationList } from "@clerk/nextjs";

export function SyncActiveOrganizationFromURL() {
  const { setActive, isLoaded, organizationList } = useOrganizationList();
  const { orgId: sessionOrgId, userId } = useAuth();
  const params = useParams();
  const router = useRouter();
  
  // Get the organization slug from the URL
  const urlOrgSlug = params?.orgId;

  useEffect(() => {

    if (!isLoaded || !urlOrgSlug || !userId) return;

    // If we have an org slug in the URL but no active org in session,
    // set the active organization to be the org from the URL
    if (urlOrgSlug && !sessionOrgId) {
      console.log("Attempting to set active organization:", urlOrgSlug);
      
      // Find the organization in the list
      const targetOrg = organizationList?.find(
        org => org.organization.slug === urlOrgSlug || org.organization.id === urlOrgSlug
      );
      
      if (targetOrg) {
        console.log("Found target organization:", targetOrg.organization);
        setActive({ organization: targetOrg.organization.id })
          .then(() => {
            console.log("Successfully set active organization");
            // Small delay to allow state to update
            setTimeout(() => {
              router.refresh();
            }, 100);
          })
          .catch((error) => {
            console.error("Failed to set active organization:", error);
          });
      } else {
        console.log("Organization not found in user's organization list");
      }
    } else if (sessionOrgId) {
      console.log("Organization already active:", sessionOrgId);
    }
  }, [sessionOrgId, isLoaded, setActive, urlOrgSlug, userId, organizationList, router]);

  return null;
}

export default SyncActiveOrganizationFromURL; 