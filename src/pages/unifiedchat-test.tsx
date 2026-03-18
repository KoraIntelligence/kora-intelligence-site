// Deprecated — redirects to /mvp
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: "/mvp", permanent: true } };
};

export default function UnifiedChatTestRedirect() {
  return null;
}
