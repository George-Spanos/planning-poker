import { useNavigate } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Component, JSX } from "solid-js";
import { Toaster } from "solid-toast";
import { Header } from "./components/header/header";
import { RoomProvider } from "./pages/room/roomState";

const queryClient = new QueryClient();

export const App: Component<{ children?: JSX.Element }> = (props) => {
  return (
    <QueryClientProvider client={queryClient} >
      <RoomProvider >
        <Header />
        {props.children}
        <Toaster position="top-right" gutter={8} />
      </RoomProvider>
    </QueryClientProvider>
  );
};

export const NoComponent: Component = () => {
  const navigate = useNavigate();
  navigate("/");
  return <></>;
};
