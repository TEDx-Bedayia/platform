"use client";

import styles from "./page.module.css"
import image from "../../public/Item-Icon.png"
import { useState, FC, CSSProperties } from "react";
import { paymentOptions, PaymentMethodKey, PaymentOptionProps } from "./methods";

const getInitialValue = (param: string): string => {
  if (typeof window === 'undefined') return '';
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(param) || '';
  } catch (error) {
    console.error("Failed to parse URL search params:", error);
    return '';
  }
};

interface CustomerDetailsProps {
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  mail: string;
  setMail: (mail: string) => void;
}

const CustomerDetails: FC<CustomerDetailsProps> = ({name, setName, phone, setPhone, mail, setMail}) => {
  return (
    <div className={styles.customer_details}>
      <h2 className={styles.customer_details_h2}>Contact Information</h2>
      <div className={styles.customer_details_grid}>
        <input
          type="text"
          placeholder="Full Name"
          className={styles.pay_input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          className={styles.pay_input}
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number (e.g., 010xxxxxxxx)"
          className={styles.pay_input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <hr className={styles.customer_details_hr} />
    </div>
  );
};

export default function Page() {
  const [activeMethod, setActiveMethod] = useState<PaymentMethodKey>('telda');
  const [hidden, setHidden] = useState<boolean>(true)
  const currentOption = paymentOptions[activeMethod];

  const [name, setName] = useState(getInitialValue('name'));
  const [phone, setPhone] = useState(getInitialValue('phone'));
  const [mail, setMail] = useState(getInitialValue('mail'));

  const activeClassName = styles.payment_option_active;

  const PaymentOption: FC<PaymentOptionProps> = ({ methodKey, name, transferTo, Icon }) => {
    const isActive = activeMethod === methodKey && !hidden;
    
    const optionClassName = [
      styles.payment_option,
      isActive ? activeClassName : ''
    ].join(' ').trim();

    const iconColorStyle: CSSProperties = {
      color: isActive ? '#4f46e5' : '#4b5563',
    };
    const transferColorStyle: CSSProperties = {
      color: isActive ? '#4f46e5' : '#9ca3af',
    };
    const indicatorStyle: CSSProperties = isActive ? {
        backgroundColor: '#4f46e5',
        borderColor: 'white',
    } : {};


    return (
      <div className={optionClassName} onClick={() => {setActiveMethod(methodKey); setHidden(false);}}>
        <span className={styles.payment_option_icon} style={iconColorStyle}>
          <Icon />
        </span>
        <span className={styles.payment_option_name}>{name}</span>
        <span className={styles.payment_option_transfer} style={transferColorStyle}>{transferTo}</span>
        <div className={styles.payment_option_indicator} style={indicatorStyle}></div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.product_area}>
        <div className={styles.product_info}>
          <img src={image.src} alt="Item Icon" className={styles.product_info_img} />
          <h1 className={styles.product_info_h1}>TedX Bedayia Ticket For 1 Person</h1>
        </div>
        <hr className={styles.product_area_hr} />
        <div className={styles.purchase_details}>
          <h2 className={styles.purchase_details_h2}>Order Cost</h2>
          <h1 className={styles.purchase_details_h1}>EGP 400.00</h1>
          <p>Ticket For 1 Person</p>
        </div>
      </div>

      <div className={styles.payment_area}>
        <h1 className={styles.payment_area_h1}>Checkout</h1>
        <hr className={styles.payment_area_hr} />

        <form>
          <CustomerDetails name={name} setName={setName} phone={phone} setPhone={setPhone} mail={mail} setMail={setMail} />
          
          <h2 className={styles.payment_area_h2}>Payment Method</h2>
          <div className={styles.payment_options_list}>
            {Object.keys(paymentOptions).map((key) => {
              const methodKey = key as PaymentMethodKey;
              const option = paymentOptions[methodKey];
              return (
                <PaymentOption
                  key={methodKey}
                  methodKey={methodKey}
                  name={option.name}
                  transferTo={option.transferTo}
                  Icon={option.icon}
                />
              );
            })}
          </div>

          <div className={styles.instruction_block} hidden={hidden}>
            <h3 className={styles.instruction_title}>How to Pay with {currentOption.name}</h3>

            <ol className={styles.instruction_list}><currentOption.instructions/></ol>

            <div>
              <input
                type="text"
                id="user-handle"
                placeholder={currentOption.placeholder}
                className={styles.pay_input}
                required
              />
            </div>

            <button type="submit" className={styles.pay_button}>
              Confirm EGP 400.00 Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}