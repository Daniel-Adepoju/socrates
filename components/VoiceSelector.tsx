import { Field, FieldError, FieldLabel } from "./ui/field";


interface VoiceSelectorProps {
  field: any;
  voiceOptions: any;
  isSubmitting?: boolean;
}


export default function VoiceSelector({ field, voiceOptions, isSubmitting }: VoiceSelectorProps) {
 
 const voices = Object.values(voiceOptions).map((v:any) => ({
  id: v.id,
  label: v.name,
  description: v.description,
 }))

 console.log("Available voices:", voices)

  return (
    <Field>
      <FieldLabel className="text-brown mb-2">Choose Assistant Voice</FieldLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {voices.map((voice) => (
          <div
            key={voice.id}
            onClick={() => !isSubmitting && field.onChange(voice.id)}
            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-start space-y-2 transition
              ${field.value === voice.id ? "border-brown bg-muted/40" : "border-gray-300 hover:bg-muted/20"}
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between w-full">
              <p className="font-semibold">{voice.label}</p>
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  field.value === voice.id ? "border-brown bg-brown" : "border-gray-400"
                }`}
              />
            </div>
            <p className="text-sm text-gray-500">{voice.description}</p>
          </div>
        ))}
      </div>
      {field?.error && <FieldError>{field.error.message}</FieldError>}
    </Field>
  );
}
