import UploadForm from "@/components/UploadForm";

export default function AddBookPage() {
  return (
    <div className="wrapper container min-h-screen bg-gray-50 px-6 py-10">
      
      {/* Header Section */}
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-brown mb-2">
          Add New Book
        </h1>
        <p className="text-gray-600">
          Upload a new book to your collection. Fill in the details below.
        </p>
      </div>

      {/* Form Section */}
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-brown mb-4">
          Book Details
        </h2>

        <UploadForm />
      </div>

    </div>
  );
}