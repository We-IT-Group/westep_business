import {useQuery} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {getBusinessWalletTransactions} from "./businessWalletTransactionsApi.ts";

export const useBusinessWalletTransactions = () =>
    useQuery({
        queryKey: ["business-wallet-transactions"],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) {
                throw new Error("No token");
            }

            return await getBusinessWalletTransactions();
        },
        retry: false,
    });
