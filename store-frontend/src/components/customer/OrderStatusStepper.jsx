import { Stepper, Step, StepLabel, Alert } from '@mui/material';
import { ORDER_STATUS_LABELS } from '../../utils/formatters';

const PICKUP_STEPS = ['PLACED', 'ACCEPTED', 'PACKED', 'READY_FOR_PICKUP', 'DELIVERED'];
const DELIVERY_STEPS = ['PLACED', 'ACCEPTED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrderStatusStepper({ status, deliveryType }) {
  if (status === 'CANCELLED') {
    return <Alert severity="error">This order was cancelled.</Alert>;
  }

  const steps = deliveryType === 'HOME_DELIVERY' ? DELIVERY_STEPS : PICKUP_STEPS;
  const activeIndex = steps.indexOf(status);

  return (
    <Stepper activeStep={activeIndex} alternativeLabel>
      {steps.map((step) => (
        <Step key={step}>
          <StepLabel>{ORDER_STATUS_LABELS[step]}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}