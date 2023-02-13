import React,{useContext, createContext} from "react";
import {useAddress, useContract, useMetamask, useContractWrite} from '@thirdweb-dev/react';
import {ethers} from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({children}) => {
    const {contract} = useContract
    ('0xe0C8C742AB61B2347D028a4ad6c4BF61c8E4d93C');

    const {mutateAsync: createCampaign}= useContractWrite(contract, 'createCampaign');
    const address = useAddress();
    const connect = useMetamask();

    const publishCampaign = async (form) => {

        try {
            const data = await createCampaign([
                address, // owner
                form.title, // title
                form.description, // description 
                form.target, 
                new Date(form.deadline).getTime(),  // deadline
                form.image
            ])

            console.log("Contarct call success", data)
        } catch (error) {
            console.log("Contarct call failure", error)
        }
    }

    const getCampaigns = async () => {
        const camapigns = await contract.call('getCampaigns');

        const parsedCampaigns = camapigns.map((campaign,i) => ({
            owner:campaign.owner,
            title:campaign.title,
            description: campaign.description,
            target: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
            image: campaign.image,
            pId: i
        }))
        return parsedCampaigns;
    }

    const getUserCampaigns = async () => {
        const allCampaigns=await getCampaigns();

        const filterCampaigns = allCampaigns.filter((campaign) =>campaign.owner===address);

        return filterCampaigns;
    }

    const donate = async (pId, amount) => {
        const data = await contract.call('donateToCampaign', pId, {
            value: ethers.utils.parseEther(amount)});

        return data;
    }

    const getDonations = async (pId) => {
        const donations = await contract.call('getDonators', pId);
        const numberOfDonations = donations[0].length;

        const parseDonations = [];

        for(let i=0; i < numberOfDonations; i++){
            parseDonations.push({
                donator: donations[0][i],
                donation: ethers.utils.formatEther(donations[1][i].toString())
            })
        }

        return parseDonations;
    }


    return (
        <StateContext.Provider 
            value={{
                address,
                contract,
                connect,
                createCampaign: publishCampaign,
                getCampaigns,
                getUserCampaigns,
                donate,
                getDonations
            }}
        >
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext (StateContext);