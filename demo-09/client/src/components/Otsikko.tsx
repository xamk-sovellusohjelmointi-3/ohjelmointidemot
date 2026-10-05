import { Typography } from '@mui/material';

interface Props {
  children: string;
  taso: "pieni" | "iso";
}

const Otsikko = ({ children, taso }: Props) => {
  return (
    <>
      {taso === "pieni" && <Typography variant="h6" sx={{ mb: 3}}>{children}</Typography>}
      {taso === "iso" && <Typography variant="h5" sx={{ mb: 3}}>{children}</Typography>}
    </>
  );
};

export default Otsikko;
