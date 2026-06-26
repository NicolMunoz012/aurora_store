export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getProfileAction, listSavedAddressesAction } from "@/lib/actions/user.actions";
import { ProfileForm } from "@/components/client/ProfileForm";
import { SavedAddressList } from "@/components/client/SavedAddressList";

export const metadata = { title: "Mi perfil — LunaRose" };

export default async function PerfilPage() {
  const [profileResult, addressesResult] = await Promise.all([
    getProfileAction(),
    listSavedAddressesAction(),
  ]);

  const profile = profileResult.data;
  const addresses = addressesResult.data ?? [];

  return (
    <div className="container-aurora py-12 max-w-2xl">
      <h1 className="font-serif text-3xl mb-2 text-gray-900">Mi perfil</h1>
      <p className="text-gray-400 text-sm mb-10">Gestiona tu información personal y direcciones.</p>

      {profile ? (
        <div className="flex flex-col gap-8">
          <section className="bg-white border border-gray-100 rounded-md p-6">
            <h2 className="font-serif text-xl text-gray-900 mb-5">Datos personales</h2>
            <ProfileForm profile={profile} />
          </section>

          <section className="bg-white border border-gray-100 rounded-md p-6">
            <h2 className="font-serif text-xl text-gray-900 mb-5">Direcciones guardadas</h2>
            <SavedAddressList addresses={addresses} />
          </section>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No se pudo cargar el perfil.</p>
      )}
    </div>
  );
}
