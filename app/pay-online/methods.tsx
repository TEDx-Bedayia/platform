import { FC } from "react";

export type PaymentMethodKey = 'telda' | 'instapay' | 'ewallet';

export interface PaymentOptionProps {
  methodKey: PaymentMethodKey;
  name: string;
  transferTo: string;
  Icon: FC;
}

interface PaymentOptionDetails {
  name: string;
  transferTo: string;
  icon: FC;
  placeholder: string;
  instructions: () => JSX.Element;
}

const WalletIcon = () => <span>💳</span>;
const InstapayIcon = () => <span>➡️</span>;
const EWalletIcon = () => <span>📱</span>;

export function Telda() {
  return (
    <>
      <li>Open your <strong>Telda</strong> app on your phone.</li>
      <li>Select the <strong>Transfer</strong> option.</li>
      <li>Send <strong>EGP 400.00</strong> to the username <strong>@alykotb</strong>.</li>
      <li>Once transferred, enter your <strong>Telda Username</strong> below to confirm.</li>
    </>
  )
}

export function Instapay() {
  return (
    <>
      <li>Open your <strong>Instapay</strong> app on your phone.</li>
      <li>Select <strong>Send Money</strong> and choose the <strong>IPA (Instapay Address)</strong> option.</li>
      <li>Send <strong>EGP 400.00</strong> to the IPA <strong>reemabdulghaffar@instapay</strong>.</li>
      <li>Once transferred, enter your <strong>Instapay IPA</strong> below to confirm.</li>
    </>
  )
}

export function EWallet() {
  return (
    <>
      <li>Go to the <strong>Payment Section</strong> of your mobile E-Wallet app (e.g., Vodafone Cash, Fawry).</li>
      <li>Choose <strong>Send Money</strong> and enter the number <strong>01003993559</strong>.</li>
      <li>Send <strong>EGP 400.00</strong>.</li>
      <li>Once transferred, enter your <strong>E-Wallet Phone Number</strong> below to confirm.</li>
    </>
  )
}

export const paymentOptions: Record<PaymentMethodKey, PaymentOptionDetails> = {
  telda: {
    name: 'Telda',
    transferTo: 'Transfer to: @tedXbis',
    icon: WalletIcon,
    placeholder: 'Your Telda Username (e.g., @JaneDoe)',
    instructions: Telda,
  },
  instapay: {
    name: 'Instapay',
    transferTo: 'IPA: XXX@XXXXX',
    icon: InstapayIcon,
    placeholder: 'Your Instapay IPA (e.g., yourname@bank)',
    instructions: Instapay,
  },
  ewallet: {
    name: 'E-Wallet',
    transferTo: 'Number: 12345XXXX',
    icon: EWalletIcon,
    placeholder: 'Your E-Wallet Phone Number (e.g., 010XXXXXXXX)',
    instructions: EWallet,
  },
};