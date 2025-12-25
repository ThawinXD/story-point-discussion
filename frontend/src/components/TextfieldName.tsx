import { TextField } from "@mui/material";

export default function TextfieldName(
  { name, setName, submitName }: { name: string; setName: (name: string) => void; submitName: (name: string) => void }
) {
  return (
    <form
      className="my-4"
      onSubmit={(e) => {
        e.preventDefault();
        submitName(name);
      }}
    >
      <TextField
        variant="outlined"
        label="User Name"
        type="text"
        fullWidth
        margin="normal"
        sx={{
          '& .MuiInputBase-root': { backgroundColor: 'rgb(241 245 249)' },
        }}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
    </form>
  )
}