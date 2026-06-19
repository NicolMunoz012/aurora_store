export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// app/(client)/perfil/page.tsx — Profile and saved addresses (Req 15.1–15.5)
// Server Component. Layout guarantees session exists.
// =============================================================================

import { getProfileAction, listSavedAddressesAction } from "@/lib/actions/user.actions";
import { ProfileForm } from "@/components/client/ProfileForm";
import { SavedAddressList } from "@/components/client/SavedAddressList";

export const metadata = { title: "Mi perfil — Aurora Belleza" };

export default async function PerfilPage() {
  const [profileResult, addressesResult] = await Promise.all([
    getProfileAction(),
    listSavedAddressesAction(),
  ]);

  const profile = profileResult.data;
  const addresses = addressesResult.data ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-white">
        Mi perfil
      </h1>

      {profile ? (
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="mb-4 text-base font-semibold text-zinc-800 dark:text-zinc-100">
              Datos personales
            </h2>
            <ProfileForm profile={profile} />
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-zinc-800 dark:text-zinc-100">
              Direcciones guardadas
            </h2>
            <SavedAddressList addresses={addresses} />
          </section>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">No se pudo cargar el perfil.</p>
      )}
    </div>
  );
}
