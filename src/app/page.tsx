import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Container maxWidth="sm">
        <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }}>
            Astra Bocconi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Site under construction.
          </Typography>
        </Stack>
      </Container>
    </div>
  );
}
