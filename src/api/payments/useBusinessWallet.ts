import {useQuery} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {getBusinessWallet} from "./businessWalletApi.ts";

export const useBusinessWallet = () =>
    useQuery({
        queryKey: ["business-wallet"],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) {
                throw new Error("No token");
            }

            return await getBusinessWallet();
        },
        retry: false,
    });
