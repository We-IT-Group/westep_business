import {useQuery} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {getBusinessWalletTopUpTransactions} from "./businessWalletTopUpTransactionsApi.ts";

export const useBusinessWalletTopUpTransactions = () =>
    useQuery({
        queryKey: ["business-wallet-top-up-transactions"],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) {
                throw new Error("No token");
            }

            return await getBusinessWalletTopUpTransactions();
        },
        retry: false,
    });
