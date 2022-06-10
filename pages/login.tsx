import React from "react";
import { getProviders, signIn } from "next-auth/react";
import { Provider } from "next-auth/providers";
import Image from 'next/image';

function Login({ providers }: { providers: Provider[] }) {
  return (
    <div className="flex flex-col min-h-screen w-full justify-center items-center bg-black">
      <div>
      <Image
        className="w-52 mb-5"
        height={208}
        width={208}
        priority
        src="https://links.papareact.com/9xl"
        alt="logo"
      />
      </div>
      {providers && Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button
            className="bg-[#18D860] text-white p-5 rounded-full"
            onClick={() => signIn(provider.id, { callbackUrl: "/" })}
          >
            Login with {provider.name}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Login;
export async function getServerSideProps() {
  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
}
