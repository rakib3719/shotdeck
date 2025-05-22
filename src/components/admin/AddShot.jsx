'use client'
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUpload, FiFilm, FiYoutube, FiImage, FiClock, FiChevronDown } from 'react-icons/fi';
import { FaPalette, FaCamera, FaLightbulb} from 'react-icons/fa';
import { GiFilmStrip, GiClapperboard } from 'react-icons/gi';
import { MdPeople, MdColorLens, MdLocationOn } from 'react-icons/md';
import axios from 'axios';
import { base_url } from '@/utils/utils';
import Swal from 'sweetalert2';
import { useSecureAxios } from '@/utils/Axios';


export default function AddShot() {
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm();


  const [showYoutubeOptions, setShowYoutubeOptions] = useState(false);
    const [showVideoOptions, setShowVideoOptions] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);


  const axiosInstence = useSecureAxios();
  const onSubmit = async (data) => {
    try {
      setIsUploading(true);
      
      // Upload image if exists
      if (data.imageUrl && data.imageUrl[0]) {
        const img = data.imageUrl[0];
        const formDataImage = new FormData();
        formDataImage.append('file', img);
        formDataImage.append('upload_preset', 'e-paper');
        formDataImage.append('cloud_name', 'djf8l2ahy');
        
        const imgResp = await axios.post(
          'https://api.cloudinary.com/v1_1/djf8l2ahy/image/upload', 
          formDataImage,
          {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
              setUploadProgress(progress);
            }
          }
        );
        
        data.imageUrl = imgResp.data.secure_url;
      }

      // Upload video if exists
      if (selectedVideo) {
        const formDataVideo = new FormData();
        formDataVideo.append('file', selectedVideo);
        formDataVideo.append('upload_preset', 'e-paper');
        formDataVideo.append('cloud_name', 'djf8l2ahy');
        
        const videoResp = await axios.post(
          'https://api.cloudinary.com/v1_1/djf8l2ahy/video/upload', 
          formDataVideo,
          {
            onUploadProgress: (progressEvent) => {
              const progress = 50 + Math.round((progressEvent.loaded * 50) / progressEvent.total);
              setUploadProgress(progress);
            }
          }
        );
        
        data.youtubeLink = videoResp.data.secure_url;
      }
   

      console.log('Final data with uploaded URLs:', data);
      const resp =await axiosInstence.post(`${base_url}/shot/create`, data);
      if(data.status){
        await  Swal.fire({
          title: "Sucess",
          text: "Shot Added Sucessfully!",
          icon: "success"})
      }
      console.log(resp, 'done')
      // Here you would typically send the data to your API
      // await axios.post('/api/shots', data);
      
      alert('Shot added successfully!');
      resetForm();

    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
    const resetForm = () => {
    reset();
    setSelectedVideo(null);
    setUploadProgress(0);
  };



   const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedVideo(file);
    setShowVideoOptions(false);
  };


  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Create a form data object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'e-paper'); 
    formData.append('cloud_name', 'djf8l2ahy'); 

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/djf8l2ahy/image/upload`, {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      const data = await response.json();
      // Set the YouTube link field with the Cloudinary URL
      reset({ ...watch(), youtubeLink: data.secure_url });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Checkbox group component
  const CheckboxGroup = ({ name, options, register, className = "" }) => (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full gap-2 ${className}`}>
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2">
          <input
            type="checkbox"
            value={option.value}
            {...register(name)}
            className="rounded bg-gray-700 border-gray-600 text-blue-500 "
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen text-gray-100 md:p-6">
      <div className="w-full mx-auto">
        <div className="flex items-center mb-8">
          <GiClapperboard className="text-2xl mr-2 text-blue-400" />
          <h1 className="text-2xl font-bold">Add New Shot</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-lg shadow-xl p-6">
          {/* Basic Information Section */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <FiFilm className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  {...register("title", { required: true })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="Shot title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-400">Title is required</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  {...register("description")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  rows={2}
                  placeholder="Brief description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Media Type *</label>
                <select
                  {...register("mediaType", { required: true })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select media type</option>
                  <option value="Movie">Movie</option>
                  <option value="TV">TV</option>
                  <option value="Trailer">Trailer</option>
                  <option value="Music Video">Music Video</option>
                  <option value="Commercial">Commercial</option>
                </select>
                {errors.mediaType && <p className="mt-1 text-sm text-red-400">Media type is required</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Release Year</label>
                <input
                  type="number"
                  {...register("releaseYear")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="2023"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block pb-2 text-xl mb-1">Genre</label>
                <CheckboxGroup
                  name="genre"
                  register={register}
                  options={[
                    { value: "Action", label: "Action" },
                    { value: "Comedy", label: "Comedy" },
                    { value: "Comic Adaptation", label: "Comic Adaptation" },
                    { value: "DC Extended Universe", label: "DC Extended Universe" },
                    { value: "Drama", label: "Drama" },
                    { value: "Satire", label: "Satire" },
                    { value: "Science Fiction", label: "Science Fiction" },
                    { value: "Vigilante", label: "Vigilante" },
                    { value: "Dark Comedy", label: "Dark Comedy" },
                    { value: "Superhero", label: "Superhero" }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Media Section */}
       <div className="mb-10">
            <div className="flex items-center mb-4">
              <FiImage className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Media</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Image *</label>
                <div className="flex">
                  <input
                    type="file"
                    accept="image/*"
                    {...register("imageUrl", { required: true })}
                    className="flex-1 bg-gray-700 border border-gray-600 max-w-[300px] md:w-auto rounded-md py-2 px-3 focus:outline-none"
                  />
                </div>
                {errors.imageUrl && <p className="mt-1 text-sm text-red-400">Image is required</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Video</label>
                <div className="flex flex-col">
                  <div className="flex">
                    <input
                      {...register("youtubeLink")}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md py-2 px-3 focus:outline-none"
                      placeholder={selectedVideo ? selectedVideo.name : "Upload a video or paste YouTube link"}
             
                    />
                    <button
                      type="button"
                      onClick={() => setShowVideoOptions(!showVideoOptions)}
                      className="bg-red-600 hover:bg-red-700 px-4 rounded-r-md flex items-center transition-colors"
                    >
                      <FiYoutube className="mr-1" /> <FiChevronDown />
                    </button>
                  </div>
                  
                  {/* Video Options Dropdown */}
                  {showVideoOptions && (
                    <div className="mt-2 bg-gray-700 rounded-md p-2 border border-gray-600">
                      <div className="flex flex-col space-y-2">
                        <label className="flex items-center px-3 py-2 hover:bg-gray-600 rounded cursor-pointer">
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleVideoUpload}
                          />
                          <span className="flex items-center">
                            <FiUpload className="mr-2" /> Upload Video
                          </span>
                        </label>
                        {/* <div 
                          className="px-3 py-2 hover:bg-gray-600 rounded cursor-pointer"
                          onClick={() => {
                            setSelectedVideo(null);
                            setValue('youtubeLink', '');
                            setShowVideoOptions(false);
                          }}
                        >
                          <span className="flex items-center">
                            <FiX className="mr-2" /> Clear
                          </span>
                        </div> */}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

        
          </div>

          {/* Technical Details Section */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <FaCamera className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Technical Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Aspect Ratio</label>
                <select
                  {...register("aspectRatio")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select aspect ratio</option>
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                  <option value="1.20">1.20</option>
                  <option value="1.33">1.33</option>
                  <option value="1.37">1.37</option>
                  <option value="1.43">1.43</option>
                  <option value="1.66">1.66</option>
                  <option value="1.78">1.78</option>
                  <option value="1.85">1.85</option>
                  <option value="1.90">1.90</option>
                  <option value="2.00">2.00</option>
                  <option value="2.20">2.20</option>
                  <option value="2.35">2.35</option>
                  <option value="2.39">2.39</option>
                  <option value="2.55">2.55</option>
                  <option value="2.67">2.67</option>
                  <option value="2.76">2.76</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Optical Format</label>
                <select
                  {...register("opticalFormat")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select optical format</option>
                  <option value="Anamorphic">Anamorphic</option>
                  <option value="Spherical">Spherical</option>
                  <option value="Super 35">Super 35</option>
                  <option value="3 perf">3 perf</option>
                  <option value="2 perf">2 perf</option>
                  <option value="Open Gate">Open Gate</option>
                  <option value="3D">3D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <select
                  {...register("format")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select format</option>
                  <option value="Film - 35mm">Film - 35mm</option>
                  <option value="Film - 16mm">Film - 16mm</option>
                  <option value="Film - Super 8mm">Film - Super 8mm</option>
                  <option value="Film - 65mm">Film - 65mm</option>
                  <option value="Film - 70mm">Film - 70mm</option>
                  <option value="Film - IMAX">Film - IMAX</option>
                  <option value="Digital">Digital</option>
                  <option value="Animation">Animation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Camera</label>
                <input
                  {...register("camera")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Sony VENICE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lens</label>
                <input
                  {...register("lens")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Cooke Anamorphic/I SF"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Film Stock / Resolution</label>
                <input
                  {...register("filmStockResolution")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. 4K"
                />
              </div>
            </div>
          </div>

          {/* Visual Style Section */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <FaPalette className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Visual Style</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-1">Color Palette</label>
                <CheckboxGroup
                  name="color"
                  register={register}
                  options={[
                    { value: "Warm", label: "Warm" },
                    { value: "Cool", label: "Cool" },
                    { value: "Mixed", label: "Mixed" },
                    { value: "Saturated", label: "Saturated" },
                    { value: "Desaturated", label: "Desaturated" },
                    { value: "Red", label: "Red" },
                    { value: "Orange", label: "Orange" },
                    { value: "Yellow", label: "Yellow" },
                    { value: "Green", label: "Green" },
                    { value: "Cyan", label: "Cyan" },
                    { value: "Blue", label: "Blue" },
                    { value: "Purple", label: "Purple" },
                    { value: "Magenta", label: "Magenta" },
                    { value: "Pink", label: "Pink" },
                    { value: "White", label: "White" },
                    { value: "Sepia", label: "Sepia" },
                    { value: "Black & White", label: "Black & White" }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Custom Color (HEX)</label>
                <div className="flex items-center">
                  <input
                    {...register("customColor")}
                    className="w-24 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                    placeholder="#RRGGBB"
                  />
                  <div className="ml-3 w-10 h-10 rounded-md border border-gray-600" 
                       style={{ backgroundColor: watch('customColor') || 'transparent' }} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time Period</label>
                <select
                  {...register("timePeriod")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select time period</option>
                  <option value="Future">Future</option>
                  <option value="2020s">2020s</option>
                  <option value="2010s">2010s</option>
                  <option value="2000s">2000s</option>
                  <option value="1900s">1900s</option>
                  <option value="1800s">1800s</option>
                  <option value="1700s">1700s</option>
                  <option value="Renaissance: 1400–1700">Renaissance: 1400–1700</option>
                  <option value="Medieval: 500–1499">Medieval: 500–1499</option>
                  <option value="Ancient: 2000BC–500AD">Ancient: 2000BC–500AD</option>
                  <option value="Stone Age: pre–2000BC">Stone Age: pre–2000BC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Frame Size</label>
                <select
                  {...register("frameSize")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select frame size</option>
                  <option value="Extreme Wide">Extreme Wide</option>
                  <option value="Wide">Wide</option>
                  <option value="Medium Wide">Medium Wide</option>
                  <option value="Medium">Medium</option>
                  <option value="Medium Close-Up">Medium Close-Up</option>
                  <option value="Close-Up">Close-Up</option>
                  <option value="Extreme Close-Up">Extreme Close-Up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Shot Type</label>
                <CheckboxGroup
                  name="shotType"
                  register={register}
                  options={[
                    { value: "Aerial", label: "Aerial" },
                    { value: "Overhead", label: "Overhead" },
                    { value: "High Angle", label: "High Angle" },
                    { value: "Low Angle", label: "Low Angle" },
                    { value: "Dutch Angle", label: "Dutch Angle" },
                    { value: "Establishing Shot", label: "Establishing Shot" },
                    { value: "Over the Shoulder", label: "Over the Shoulder" },
                    { value: "Clean Single", label: "Clean Single" },
                    { value: "2 Shot", label: "2 Shot" },
                    { value: "3 Shot", label: "3 Shot" },
                    { value: "Group Shot", label: "Group Shot" },
                    { value: "Insert", label: "Insert" }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lens Size</label>
                <select
                  {...register("lensSize")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select lens size</option>
                  <option value="Ultra Wide / Fisheye">Ultra Wide / Fisheye</option>
                  <option value="Wide">Wide</option>
                  <option value="Medium">Medium</option>
                  <option value="Long Lens">Long Lens</option>
                  <option value="Telephoto">Telephoto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Composition</label>
                <select
                  {...register("composition")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select composition</option>
                  <option value="Center">Center</option>
                  <option value="Left Heavy">Left Heavy</option>
                  <option value="Right Heavy">Right Heavy</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Symmetrical">Symmetrical</option>
                  <option value="Short Side">Short Side</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lighting Section */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <FaLightbulb className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Lighting</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Lighting Style</label>
                <CheckboxGroup
                  name="lightingStyle"
                  register={register}
                  options={[
                    { value: "Soft Light", label: "Soft Light" },
                    { value: "Hard Light", label: "Hard Light" },
                    { value: "High Contrast", label: "High Contrast" },
                    { value: "Low Contrast", label: "Low Contrast" },
                    { value: "Silhouette", label: "Silhouette" },
                    { value: "Top Light", label: "Top Light" },
                    { value: "Underlight", label: "Underlight" },
                    { value: "Side Light", label: "Side Light" },
                    { value: "Backlight", label: "Backlight" },
                    { value: "Edge Light", label: "Edge Light" }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lighting Type</label>
                <CheckboxGroup
                  name="lightingType"
                  register={register}
                  options={[
                    { value: "Daylight", label: "Daylight" },
                    { value: "Sunny", label: "Sunny" },
                    { value: "Overcast", label: "Overcast" },
                    { value: "Moonlight", label: "Moonlight" },
                    { value: "Artificial Light", label: "Artificial Light" },
                    { value: "Practical Light", label: "Practical Light" },
                    { value: "Fluorescent", label: "Fluorescent" },
                    { value: "Firelight", label: "Firelight" },
                    { value: "Mixed Light", label: "Mixed Light" }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time of Day</label>
                <CheckboxGroup
                  name="timeOfDay"
                  register={register}
                  options={[
                    { value: "Day", label: "Day" },
                    { value: "Night", label: "Night" },
                    { value: "Dusk", label: "Dusk" },
                    { value: "Dawn", label: "Dawn" },
                    { value: "Sunrise", label: "Sunrise" },
                    { value: "Sunset", label: "Sunset" }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Interior/Exterior</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="Interior"
                      {...register("interiorExterior")}
                      className="rounded bg-gray-700 border-gray-600 text-blue-500 "
                    />
                    <span>Interior</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="Exterior"
                      {...register("interiorExterior")}
                      className="rounded bg-gray-700 border-gray-600 text-blue-500 "
                    />
                    <span>Exterior</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* People Section */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <MdPeople className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">People</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Director</label>
                <input
                  {...register("director")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Fred Toye"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cinematographer</label>
                <input
                  {...register("cinematographer")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Dan Stoloff"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Production Designer</label>
                <input
                  {...register("productionDesigner")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Arvinder Grewal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Costume Designer</label>
                <input
                  {...register("costumeDesigner")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Rebecca Gregg, Laura Jean Shannon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Editor</label>
                <input
                  {...register("editor")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Jonathan Chibnall"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Colorist</label>
                <input
                  {...register("colorist")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Siggy Ferstl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Actors</label>
                <input
                  {...register("actors")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Erin Moriarty"
                />
              </div>
            </div>
          </div>

          {/* Location & Time Section */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <MdLocationOn className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Location & Time</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Shot Time</label>
                <div className="flex items-center">
                  <input
                    {...register("shotTime")}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                    placeholder="e.g. 00:21:15"
                  />
                  <FiClock className="ml-2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Set</label>
                <input
                  {...register("set")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Car (Driving) > Front Passenger Seat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Story Location</label>
                <input
                  {...register("storyLocation")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. New York > New York City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Filming Location</label>
                <input
                  {...register("filmingLocation")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Canada > Ontario"
                />
              </div>
            </div>
          </div>

    {/* Upload Progress */}
                   {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}
          {/* Submit Section */}
      <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
              disabled={isUploading}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center justify-center min-w-32"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Add Shot'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}





























// 'use client'
// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { FiUpload, FiFilm, FiYoutube, FiImage, FiClock, FiChevronDown, FiX } from 'react-icons/fi';
// import { FaPalette, FaCamera, FaLightbulb } from 'react-icons/fa';
// import { GiFilmStrip, GiClapperboard } from 'react-icons/gi';
// import { MdPeople, MdColorLens, MdLocationOn } from 'react-icons/md';
// import axios from 'axios';

// export default function AddShot() {
//   const { 
//     register, 
//     handleSubmit, 
//     watch, 
//     reset, 
//     setValue,
//     formState: { errors } 
//   } = useForm();
  
//   const [showVideoOptions, setShowVideoOptions] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [selectedVideo, setSelectedVideo] = useState(null);

//   const onSubmit = async (data) => {
//     try {
//       setIsUploading(true);
      
//       // Upload image if exists
//       if (data.imageUrl && data.imageUrl[0]) {
//         const img = data.imageUrl[0];
//         const formDataImage = new FormData();
//         formDataImage.append('file', img);
//         formDataImage.append('upload_preset', 'e-paper');
//         formDataImage.append('cloud_name', 'djf8l2ahy');
        
//         const imgResp = await axios.post(
//           'https://api.cloudinary.com/v1_1/djf8l2ahy/image/upload', 
//           formDataImage,
//           {
//             onUploadProgress: (progressEvent) => {
//               const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
//               setUploadProgress(progress);
//             }
//           }
//         );
        
//         data.imageUrl = imgResp.data.secure_url;
//       }

//       // Upload video if exists
//       if (selectedVideo) {
//         const formDataVideo = new FormData();
//         formDataVideo.append('file', selectedVideo);
//         formDataVideo.append('upload_preset', 'e-paper');
//         formDataVideo.append('cloud_name', 'djf8l2ahy');
        
//         const videoResp = await axios.post(
//           'https://api.cloudinary.com/v1_1/djf8l2ahy/video/upload', 
//           formDataVideo,
//           {
//             onUploadProgress: (progressEvent) => {
//               const progress = 50 + Math.round((progressEvent.loaded * 50) / progressEvent.total);
//               setUploadProgress(progress);
//             }
//           }
//         );
        
//         data.youtubeLink = videoResp.data.secure_url;
//       }

//       console.log('Final data with uploaded URLs:', data);
//       // Here you would typically send the data to your API
//       // await axios.post('/api/shots', data);
      
//       alert('Shot added successfully!');
//       resetForm();

//     } catch (error) {
//       console.error('Upload error:', error);
//       alert('Error uploading files. Please try again.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const resetForm = () => {
//     reset();
//     setSelectedVideo(null);
//     setUploadProgress(0);
//   };

//   const handleVideoUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setSelectedVideo(file);
//     setShowVideoOptions(false);
//   };

//   // Checkbox group component
//   const CheckboxGroup = ({ name, options, register, className = "" }) => (
//     <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full gap-2 ${className}`}>
//       {options.map((option) => (
//         <label key={option.value} className="flex items-center space-x-2">
//           <input
//             type="checkbox"
//             value={option.value}
//             {...register(name)}
//             className="rounded bg-gray-700 border-gray-600 text-blue-500"
//           />
//           <span>{option.label}</span>
//         </label>
//       ))}
//     </div>
//   );

//   return (
//     <div className="min-h-screen text-gray-100 p-6 bg-gray-900">
//       <div className="w-full max-w-6xl mx-auto">
//         <div className="flex items-center mb-8">
//           <GiClapperboard className="text-2xl mr-2 text-blue-400" />
//           <h1 className="text-2xl font-bold">Add New Shot</h1>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-lg shadow-xl p-6">
//           {/* Basic Information Section */}
//           <div className="mb-10">
//             <div className="flex items-center mb-4">
//               <FiFilm className="mr-2 text-blue-400" />
//               <h2 className="text-xl font-semibold">Basic Information</h2>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Title *</label>
//                 <input
//                   {...register("title", { required: true })}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Shot title"
//                 />
//                 {errors.title && <p className="mt-1 text-sm text-red-400">Title is required</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Description</label>
//                 <textarea
//                   {...register("description")}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   rows={2}
//                   placeholder="Brief description"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Media Type *</label>
//                 <select
//                   {...register("mediaType", { required: true })}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select media type</option>
//                   <option value="Movie">Movie</option>
//                   <option value="TV">TV</option>
//                   <option value="Trailer">Trailer</option>
//                   <option value="Music Video">Music Video</option>
//                   <option value="Commercial">Commercial</option>
//                 </select>
//                 {errors.mediaType && <p className="mt-1 text-sm text-red-400">Media type is required</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Release Year</label>
//                 <input
//                   type="number"
//                   {...register("releaseYear")}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="2023"
//                   min="1900"
//                   max={new Date().getFullYear()}
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block pb-2 text-xl mb-1">Genre</label>
//                 <CheckboxGroup
//                   name="genre"
//                   register={register}
//                   options={[
//                     { value: "Action", label: "Action" },
//                     { value: "Comedy", label: "Comedy" },
//                     { value: "Drama", label: "Drama" },
//                     { value: "Science Fiction", label: "Science Fiction" },
//                     { value: "Horror", label: "Horror" },
//                     { value: "Romance", label: "Romance" },
//                     { value: "Thriller", label: "Thriller" },
//                     { value: "Documentary", label: "Documentary" }
//                   ]}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Media Section */}
//           <div className="mb-10">
//             <div className="flex items-center mb-4">
//               <FiImage className="mr-2 text-blue-400" />
//               <h2 className="text-xl font-semibold">Media</h2>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Image *</label>
//                 <div className="flex">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     {...register("imageUrl", { required: true })}
//                     className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none"
//                   />
//                 </div>
//                 {errors.imageUrl && <p className="mt-1 text-sm text-red-400">Image is required</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Video</label>
//                 <div className="flex flex-col">
//                   <div className="flex">
//                     <input
//                       {...register("youtubeLink")}
//                       className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md py-2 px-3 focus:outline-none"
//                       placeholder={selectedVideo ? selectedVideo.name : "Upload a video or paste YouTube link"}
//                       readOnly
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowVideoOptions(!showVideoOptions)}
//                       className="bg-red-600 hover:bg-red-700 px-4 rounded-r-md flex items-center transition-colors"
//                     >
//                       <FiYoutube className="mr-1" /> <FiChevronDown />
//                     </button>
//                   </div>
                  
//                   {/* Video Options Dropdown */}
//                   {showVideoOptions && (
//                     <div className="mt-2 bg-gray-700 rounded-md p-2 border border-gray-600">
//                       <div className="flex flex-col space-y-2">
//                         <label className="flex items-center px-3 py-2 hover:bg-gray-600 rounded cursor-pointer">
//                           <input
//                             type="file"
//                             accept="video/*"
//                             className="hidden"
//                             onChange={handleVideoUpload}
//                           />
//                           <span className="flex items-center">
//                             <FiUpload className="mr-2" /> Upload Video
//                           </span>
//                         </label>
//                         <div 
//                           className="px-3 py-2 hover:bg-gray-600 rounded cursor-pointer"
//                           onClick={() => {
//                             setSelectedVideo(null);
//                             setValue('youtubeLink', '');
//                             setShowVideoOptions(false);
//                           }}
//                         >
//                           <span className="flex items-center">
//                             <FiX className="mr-2" /> Clear
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Upload Progress */}
//             {isUploading && (
//               <div className="mt-4">
//                 <div className="w-full bg-gray-700 rounded-full h-2.5">
//                   <div 
//                     className="bg-blue-600 h-2.5 rounded-full" 
//                     style={{ width: `${uploadProgress}%` }}
//                   ></div>
//                 </div>
//                 <p className="text-sm text-gray-400 mt-1">
//                   Uploading: {uploadProgress}%
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Technical Details Section */}
//           <div className="mb-10">
//             <div className="flex items-center mb-4">
//               <FaCamera className="mr-2 text-blue-400" />
//               <h2 className="text-xl font-semibold">Technical Details</h2>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Aspect Ratio</label>
//                 <select
//                   {...register("aspectRatio")}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select aspect ratio</option>
//                   <option value="16:9">16:9</option>
//                   <option value="4:3">4:3</option>
//                   <option value="1.85:1">1.85:1</option>
//                   <option value="2.39:1">2.39:1</option>
//                   <option value="1:1">1:1</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Camera</label>
//                 <input
//                   {...register("camera")}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="e.g. Sony A7S III"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Lens</label>
//                 <input
//                   {...register("lens")}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="e.g. Canon 24-70mm f/2.8"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Submit Section */}
//           <div className="flex justify-end space-x-4 mt-8">
//             <button
//               type="button"
//               onClick={resetForm}
//               className="px-6 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
//               disabled={isUploading}
//             >
//               Reset
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center justify-center min-w-32"
//               disabled={isUploading}
//             >
//               {isUploading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Uploading...
//                 </>
//               ) : (
//                 'Add Shot'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }




