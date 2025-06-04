'use client';
import { useGetMyShotQuery, useGetShotCountQuery, useGetShotsQuery } from '@/redux/api/shot';
import { useSecureAxios } from '@/utils/Axios';
import { base_url, filters } from '@/utils/utils';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Swal from 'sweetalert2';

function Browse() {
  // ... (previous state declarations)

  // New state for collections
  const [collections, setCollections] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollections, setSelectedCollections] = useState({});
  const [currentShotForCollections, setCurrentShotForCollections] = useState(null);

  // Fetch user's collections
  const fetchCollections = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/shot/collection/user/${Userid}`);
      setCollections(response.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  }, [Userid, axiosInstance]);

  useEffect(() => {
    if (Userid) {
      fetchCollections();
    }
  }, [Userid, fetchCollections]);

  // Check if shot is in any collection
  const isShotInCollections = (shotId) => {
    return collections.some(collection => 
      collection.shots.some(shot => shot._id === shotId)
  };

  // Get collections containing a specific shot
  const getCollectionsForShot = (shotId) => {
    return collections.filter(collection => 
      collection.shots.some(shot => shot._id === shotId)
  };

  // Create new collection
  const createCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    try {
      const response = await axiosInstance.post(`/shot/collection/create`, {
        userId: Userid,
        name: newCollectionName
      });
      
      setCollections([...collections, response.data]);
      setNewCollectionName('');
      Swal.fire({
        title: 'Success',
        text: 'Collection created successfully',
        icon: 'success',
      });
    } catch (error) {
      console.error('Error creating collection:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to create collection',
        icon: 'error',
      });
    }
  };

  // Add/remove shot from collections
  const updateShotCollections = async () => {
    if (!currentShotForCollections) return;

    try {
      const collectionsToAdd = Object.entries(selectedCollections)
        .filter(([_, isSelected]) => isSelected)
        .map(([collectionId]) => collectionId);

      const response = await axiosInstance.put(`/shot/collection/update`, {
        userId: Userid,
        shotId: currentShotForCollections._id,
        collections: collectionsToAdd
      });

      console.log('Collection update response:', {
        collectionName: collections.find(c => c._id === collectionsToAdd[0])?.name || 'Multiple collections',
        shotData: currentShotForCollections
      });

      fetchCollections();
      setShowCollectionModal(false);
      Swal.fire({
        title: 'Success',
        text: 'Collections updated successfully',
        icon: 'success',
      });
    } catch (error) {
      console.error('Error updating collections:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update collections',
        icon: 'error',
      });
    }
  };

  // Open collection management modal
  const openCollectionModal = (shot, e) => {
    e.stopPropagation();
    setCurrentShotForCollections(shot);
    
    // Initialize selected collections state
    const initialSelected = {};
    collections.forEach(collection => {
      initialSelected[collection._id] = collection.shots.some(s => s._id === shot._id);
    });
    setSelectedCollections(initialSelected);
    
    setShowCollectionModal(true);
  };

  // ... (previous code remains the same until the shot rendering part)

  // In your shot rendering logic, modify the hover effect to show collection flag
  {shots.map((data, idx) => {
    const isInCollection = isShotInCollections(data._id);
    const containingCollections = getCollectionsForShot(data._id);

    return (
      <motion.div
        key={`${data._id}-${idx}`}
        // ... (previous props)
      >
        <div className="relative">
          {/* ... (image rendering code) */}
          
          {/* Collection indicator flag */}
          {isInCollection && (
            <div 
              className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded cursor-pointer"
              onClick={(e) => openCollectionModal(data, e)}
            >
              {containingCollections.length > 1 ? 
                `${containingCollections.length} Collections` : 
                containingCollections[0].name}
            </div>
          )}

          <div className="absolute inset-0 bg-black flex flex-col justify-between p-2 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
            {/* ... (previous hover content) */}
            <button
              className="cursor-pointer text-xs px-2 py-1 rounded self-start hover:underline transition-colors"
              onClick={(e) => openCollectionModal(data, e)}
            >
              {isInCollection ? 'Manage Collections' : 'Add to Collection'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  })}

  {/* Add Collection Management Modal */}
  <AnimatePresence>
    {showCollectionModal && currentShotForCollections && (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowCollectionModal(false)}
      >
        <motion.div
          className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-md"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold mb-4">Manage Collections</h3>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Add to existing collections:</h4>
            {collections.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {collections.map(collection => (
                  <label key={collection._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCollections[collection._id] || false}
                      onChange={(e) => setSelectedCollections({
                        ...selectedCollections,
                        [collection._id]: e.target.checked
                      })}
                    />
                    <span>{collection.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No collections yet</p>
            )}
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Or create new collection:</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                className="flex-1 bg-[#333] text-white px-3 py-2 rounded"
              />
              <button
                onClick={createCollection}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowCollectionModal(false)}
              className="px-4 py-2 rounded border border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={updateShotCollections}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* ... (rest of the existing code) */}
}

// ... (remaining code)







const ocHaron = {
  "message": "Success",
  "data": [
    {
      "_id": "6837d1da48dcf62bc2ec6f34",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "683584eb601a79daf8be29b6",
      "data": {
        "_id": "683584eb601a79daf8be29b6",
        "title": "Aspernatur quis et q",
        "description": "Velit id et sunt s",
        "imageUrl": "https://res.cloudinary.com/djf8l2ahy/image/upload/v1748337898/dalpwek6g4xtqlve5dcg.jpg",
        "youtubeLink": "https://youtu.be/YiSQ_db-Dcw?si=jzKUKxw3BAJ5_Gji",
        "gallery": [],
        "mediaType": "TV",
        "genre": [
          "Music Video",
          "Commercial"
        ],
        "releaseYear": 1991,
        "timePeriod": "Future",
        "color": [
          "Warm",
          "Cool",
          "Orange",
          "Yellow",
          "Purple",
          "Pink"
        ],
        "customColor": "Eu est numquam laud",
        "aspectRatio": "2.35",
        "opticalFormat": "Super 35",
        "labProcess": [],
        "format": "Digital",
        "interiorExterior": "Exterior",
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "Medium Close-Up",
        "shotType": [
          "false"
        ],
        "composition": "Right Heavy",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Dolor ratione volupt",
        "status": "active",
        "cinematographer": "Culpa voluptatum qu",
        "productionDesigner": "Natus quas voluptate",
        "costumeDesigner": "Omnis explicabo Und",
        "editor": [
          "Praesentium voluptat"
        ],
        "camera": "Inventore voluptate ",
        "lens": [
          "Qui eu quidem repell"
        ],
        "shotTime": "Esse sed commodi cul",
        "set": "Nobis do cupiditate ",
        "storyLocation": "Nobis beatae in simi",
        "filmingLocation": "Nulla et id labore c",
        "actors": "Facilis pariatur Pe",
        "filmStockResolution": "Dolorum quis ex nost",
        "email": "bannah76769@gmail.com",
        "userId": "68356c67de55b80027ed7aab",
        "tags": [],
        "keywords": [],
        "colorist": "In ducimus eius pro",
        "createdAt": "2025-05-27T09:24:59.783Z",
        "updatedAt": "2025-05-28T19:21:36.342Z",
        "__v": 0,
        "click": 5
      },
      "__v": 0
    },
    {
      "_id": "683940b96b804438905de146",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "6837db574251aa121e46a583",
      "data": {
        "_id": "6837db574251aa121e46a583",
        "title": "Deserunt reprehender",
        "description": "Molestiae qui totam ",
        "imageUrl": "https://res.cloudinary.com/djf8l2ahy/image/upload/v1748491092/mplkfcpajirmpccobfo9.jpg",
        "youtubeLink": "https://youtu.be/YiSQ_db-Dcw?si=GHWLewrJDIek3rFJ",
        "gallery": [],
        "mediaType": "Commercial",
        "genre": [
          "Movie/TV",
          "Music Video",
          "Commercial"
        ],
        "releaseYear": 1972,
        "timePeriod": "1700s",
        "color": [
          "Cool",
          "Mixed",
          "Red",
          "Magenta",
          "Pink",
          "White"
        ],
        "customColor": "Est odit dolor volu",
        "aspectRatio": "1.33",
        "opticalFormat": "2 perf",
        "labProcess": [],
        "format": "Film - 35mm",
        "interiorExterior": "Exterior",
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "Medium Wide",
        "shotType": [
          "false"
        ],
        "composition": "Center",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Culpa fugiat qui om",
        "status": "active",
        "cinematographer": "Sed ad labore optio",
        "productionDesigner": "Culpa qui dolorum id",
        "costumeDesigner": "Nisi tenetur volupta",
        "editor": [
          "Atque quod quo nulla"
        ],
        "camera": "Ut excepturi maiores",
        "lens": [
          "Est commodo qui volu"
        ],
        "shotTime": "Consectetur fugit ",
        "set": "Iste cupiditate volu",
        "storyLocation": "Voluptatem Consequa",
        "filmingLocation": "Et velit dolores de",
        "actors": "Modi voluptatem Qua",
        "filmStockResolution": "Rem quos dolore amet",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [],
        "keywords": [],
        "colorist": "Voluptates aut in vo",
        "createdAt": "2025-05-29T03:58:15.724Z",
        "updatedAt": "2025-05-29T14:54:30.428Z",
        "__v": 0,
        "click": 1
      },
      "__v": 0
    },
    {
      "_id": "683940bc6b804438905de149",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "683585e5601a79daf8be29c2",
      "data": {
        "_id": "683585e5601a79daf8be29c2",
        "title": "Velit quibusdam nih",
        "description": "Placeat excepturi n",
        "imageUrl": "https://res.cloudinary.com/djf8l2ahy/image/upload/v1748338147/nzrfywgko4c5co9oljx4.jpg",
        "youtubeLink": "https://youtu.be/YiSQ_db-Dcw?si=jzKUKxw3BAJ5_Gji",
        "gallery": [],
        "mediaType": "Trailer",
        "genre": [
          "Music Video",
          "Commercial"
        ],
        "releaseYear": 1982,
        "timePeriod": "2010s",
        "color": [
          "Mixed",
          "Saturated",
          "Desaturated",
          "Red",
          "Yellow",
          "Green"
        ],
        "customColor": "Placeat autem nihil",
        "aspectRatio": "1.33",
        "opticalFormat": "3D",
        "labProcess": [],
        "format": "Film - 65mm",
        "interiorExterior": "Interior",
        "timeOfDay": [
          "Day",
          "Sunrise",
          "Sunset"
        ],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "Extreme Close-Up",
        "shotType": [
          "Aerial",
          "Dutch Angle",
          "2 Shot"
        ],
        "composition": "Right Heavy",
        "lightingStyle": [
          "Hard Light",
          "Underlight",
          "Backlight"
        ],
        "lightingType": [
          "Mixed Light"
        ],
        "director": "Vero est optio vol",
        "status": "active",
        "cinematographer": "Quo voluptatem iusto",
        "productionDesigner": "Quis eos quia minus ",
        "costumeDesigner": "Saepe quo deserunt r",
        "editor": [
          "Iusto dolor ut asper"
        ],
        "camera": "Et id libero tempor ",
        "lens": [
          "Ratione ea ea offici"
        ],
        "shotTime": "Nemo est dolor null",
        "set": "Commodi sint sunt a",
        "storyLocation": "Laborum Ex similiqu",
        "filmingLocation": "Voluptatibus et ut a",
        "actors": "Sunt asperiores har",
        "filmStockResolution": "Fugiat commodi non o",
        "email": "bannah76769@gmail.com",
        "userId": "68356c67de55b80027ed7aab",
        "tags": [],
        "keywords": [],
        "colorist": "Reprehenderit fugiat",
        "createdAt": "2025-05-27T09:29:09.041Z",
        "updatedAt": "2025-05-30T03:52:03.106Z",
        "__v": 0,
        "click": 3
      },
      "__v": 0
    },
    {
      "_id": "683940be6b804438905de14c",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "68358635601a79daf8be29cb",
      "data": {
        "_id": "68358635601a79daf8be29cb",
        "title": "Culpa in eu labore n",
        "description": "Optio consequat Do",
        "imageUrl": "https://res.cloudinary.com/djf8l2ahy/image/upload/v1748338228/petu9vjpj7yggyfftwbv.jpg",
        "youtubeLink": "https://youtu.be/YiSQ_db-Dcw?si=jzKUKxw3BAJ5_Gji",
        "gallery": [],
        "mediaType": "TV",
        "genre": [
          "Music Video"
        ],
        "releaseYear": 1986,
        "timePeriod": "Stone Age: pre–2000BC",
        "color": [
          "Mixed",
          "Saturated",
          "Cyan",
          "Blue",
          "Purple",
          "White"
        ],
        "customColor": "Neque fuga Duis ali",
        "aspectRatio": "2.39",
        "opticalFormat": "Anamorphic",
        "labProcess": [],
        "format": "Animation",
        "interiorExterior": "Interior",
        "timeOfDay": [
          "Day",
          "Dawn",
          "Sunset"
        ],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "Medium Close-Up",
        "shotType": [
          "false"
        ],
        "composition": "Balanced",
        "lightingStyle": [
          "Soft Light",
          "Side Light",
          "Backlight"
        ],
        "lightingType": [
          "Sunny",
          "Artificial Light",
          "Practical Light",
          "Mixed Light"
        ],
        "director": "Sequi laboriosam di",
        "status": "active",
        "cinematographer": "Veniam dolore ipsam",
        "productionDesigner": "Fugit dolore libero",
        "costumeDesigner": "Eum laborum pariatur",
        "editor": [
          "Molestias consectetu"
        ],
        "camera": "Dolor eiusmod odio e",
        "lens": [
          "Aperiam fugit exerc"
        ],
        "shotTime": "Laborum Unde volupt",
        "set": "Iure quas consequat",
        "storyLocation": "Quos ut cum optio d",
        "filmingLocation": "Sapiente eu quia et ",
        "actors": "Sapiente mollitia se",
        "filmStockResolution": "Cum rerum quas ad no",
        "email": "bannah76769@gmail.com",
        "userId": "68356c67de55b80027ed7aab",
        "tags": [],
        "keywords": [],
        "colorist": "Exercitationem dolor",
        "createdAt": "2025-05-27T09:30:29.893Z",
        "updatedAt": "2025-05-30T03:48:59.613Z",
        "__v": 0,
        "click": 2
      },
      "__v": 0
    },
    {
      "_id": "683940c06b804438905de14f",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "68358652601a79daf8be29ce",
      "data": {
        "_id": "68358652601a79daf8be29ce",
        "title": "Et accusamus eveniet",
        "description": "Illo soluta quo cons",
        "imageUrl": "https://res.cloudinary.com/djf8l2ahy/image/upload/v1748338256/bwrjgfsuxy6etmpegcpq.jpg",
        "youtubeLink": "https://youtu.be/YiSQ_db-Dcw?si=jzKUKxw3BAJ5_Gji",
        "gallery": [],
        "mediaType": "Commercial",
        "genre": [
          "Commercial"
        ],
        "releaseYear": 2005,
        "timePeriod": "1800s",
        "color": [
          "Warm",
          "Yellow",
          "Green",
          "Cyan",
          "Purple",
          "Magenta",
          "Pink",
          "White",
          "Sepia"
        ],
        "customColor": "Et totam quia pariat",
        "aspectRatio": "1.43",
        "opticalFormat": "Super 35",
        "labProcess": [],
        "format": "Film - IMAX",
        "interiorExterior": "Interior",
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "Medium Wide",
        "shotType": [
          "false"
        ],
        "composition": "Symmetrical",
        "lightingStyle": [
          "Soft Light",
          "High Contrast"
        ],
        "lightingType": [
          "Daylight",
          "Moonlight",
          "Practical Light"
        ],
        "director": "Rerum ut sit proide",
        "status": "active",
        "cinematographer": "Qui rem dolor earum ",
        "productionDesigner": "Reprehenderit corru",
        "costumeDesigner": "Sunt necessitatibus",
        "editor": [
          "Do ut praesentium mo"
        ],
        "camera": "Minim iusto temporib",
        "lens": [
          "Minima vitae incidun"
        ],
        "shotTime": "Quis est nisi nihil ",
        "set": "Veniam quia qui dol",
        "storyLocation": "Culpa nostrud neque",
        "filmingLocation": "Hic qui tempore nos",
        "actors": "Ea sunt nulla et ea ",
        "filmStockResolution": "Nihil cillum totam t",
        "email": "bannah76769@gmail.com",
        "userId": "68356c67de55b80027ed7aab",
        "tags": [],
        "keywords": [],
        "colorist": "Obcaecati ullam exer",
        "createdAt": "2025-05-27T09:30:58.637Z",
        "updatedAt": "2025-05-29T16:24:05.910Z",
        "__v": 0,
        "click": 1
      },
      "__v": 0
    },
    {
      "_id": "683940c56b804438905de153",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "6835bd117c899b94928509c4",
      "data": {
        "_id": "6835bd117c899b94928509c4",
        "title": "AAAA",
        "description": "",
        "imageUrl": "https://res.cloudinary.com/djf8l2ahy/image/upload/v1748352268/pcy5dmj1l4kf6iiq9jem.jpg",
        "youtubeLink": "https://www.youtube.com/watch?v=XPm7zy-X_fI",
        "gallery": [],
        "mediaType": "Movie",
        "genre": [
          "Movie/TV"
        ],
        "releaseYear": null,
        "timePeriod": "",
        "color": [
          "false"
        ],
        "customColor": "",
        "aspectRatio": "",
        "opticalFormat": "",
        "labProcess": [],
        "format": "",
        "interiorExterior": null,
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "",
        "shotType": [
          "false"
        ],
        "composition": "",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "",
        "status": "active",
        "cinematographer": "",
        "productionDesigner": "",
        "costumeDesigner": "",
        "editor": [
          ""
        ],
        "camera": "",
        "lens": [
          ""
        ],
        "shotTime": "",
        "set": "",
        "storyLocation": "",
        "filmingLocation": "",
        "actors": "",
        "filmStockResolution": "",
        "email": "test@gmail.com",
        "userId": "682d98178e34f7d2aea6ed6b",
        "tags": [],
        "keywords": [],
        "colorist": "",
        "createdAt": "2025-05-27T13:24:33.173Z",
        "updatedAt": "2025-05-30T04:28:14.241Z",
        "__v": 0,
        "click": 7
      },
      "__v": 0
    },
    {
      "_id": "683940ca6b804438905de157",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "68358674601a79daf8be29d1",
      "data": {
        "_id": "68358674601a79daf8be29d1",
        "title": "Esse nesciunt et ea",
        "description": "Debitis molestiae et",
        "imageUrl": "https://res.cloudinary.com/djf8l2ahy/image/upload/v1748338290/fsf8x2yq93d6gvmjfjqz.jpg",
        "youtubeLink": "https://youtu.be/YiSQ_db-Dcw?si=jzKUKxw3BAJ5_Gji",
        "gallery": [],
        "mediaType": "Trailer",
        "genre": [
          "false"
        ],
        "releaseYear": 1997,
        "timePeriod": "1700s",
        "color": [
          "Warm",
          "Mixed",
          "Desaturated",
          "Cyan",
          "Blue",
          "Magenta",
          "Pink",
          "White",
          "Sepia",
          "Black & White"
        ],
        "customColor": "Exercitation dolor d",
        "aspectRatio": "2.35",
        "opticalFormat": "3 perf",
        "labProcess": [],
        "format": "Film - 16mm",
        "interiorExterior": "Interior",
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "Extreme Close-Up",
        "shotType": [
          "Aerial",
          "Dutch Angle",
          "2 Shot",
          "Insert"
        ],
        "composition": "Right Heavy",
        "lightingStyle": [
          "Top Light"
        ],
        "lightingType": [
          "Daylight",
          "Moonlight"
        ],
        "director": "Voluptate et dolores",
        "status": "active",
        "cinematographer": "Eiusmod sed ducimus",
        "productionDesigner": "Nihil ut quia mollit",
        "costumeDesigner": "Alias neque adipisci",
        "editor": [
          "Pariatur Corrupti "
        ],
        "camera": "Incidunt qui vitae ",
        "lens": [
          "Odit expedita volupt"
        ],
        "shotTime": "Ea ut quisquam moles",
        "set": "Nisi ea itaque excep",
        "storyLocation": "Culpa minima distin",
        "filmingLocation": "Rerum iste tempore ",
        "actors": "Sed autem sit blandi",
        "filmStockResolution": "Ipsum voluptatibus m",
        "email": "bannah76769@gmail.com",
        "userId": "68356c67de55b80027ed7aab",
        "tags": [],
        "keywords": [],
        "colorist": "Qui ut sed Nam venia",
        "createdAt": "2025-05-27T09:31:32.319Z",
        "updatedAt": "2025-05-29T16:24:07.982Z",
        "__v": 0,
        "click": 2
      },
      "__v": 0
    },
    {
      "_id": "683941976b804438905de160",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "68358479601a79daf8be29aa",
      "data": {
        "_id": "68358479601a79daf8be29aa",
        "title": "Ea similique quas si",
        "description": "Magna labore cum est",
        "imageUrl": "https://res.cloudinary.com/djf8l2ahy/image/upload/v1748337784/u26qj9gv3yeraynwsumb.jpg",
        "youtubeLink": "https://youtu.be/YiSQ_db-Dcw?si=jzKUKxw3BAJ5_Gji",
        "gallery": [],
        "mediaType": "Trailer",
        "genre": [
          "Movie/TV",
          "Music Video",
          "Commercial"
        ],
        "releaseYear": 1983,
        "timePeriod": "1700s",
        "color": [
          "Warm",
          "Orange",
          "Cyan",
          "Purple",
          "Sepia"
        ],
        "customColor": "Reprehenderit facil",
        "aspectRatio": "2.00",
        "opticalFormat": "3D",
        "labProcess": [],
        "format": "Digital",
        "interiorExterior": "Interior",
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "Wide",
        "shotType": [
          "false"
        ],
        "composition": "Right Heavy",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Nesciunt ut dolores",
        "status": "active",
        "cinematographer": "Voluptatibus velit ",
        "productionDesigner": "Laborum Aut commodo",
        "costumeDesigner": "Assumenda placeat i",
        "editor": [
          "Nam magna alias esse"
        ],
        "camera": "Aliquid est quia co",
        "lens": [
          "Tempora possimus qu"
        ],
        "shotTime": "Quis deserunt cum ut",
        "set": "Voluptatem commodi ",
        "storyLocation": "Delectus aut tenetu",
        "filmingLocation": "Dolores corrupti re",
        "actors": "Impedit placeat ad",
        "filmStockResolution": "Ipsam id ipsa in qu",
        "email": "bannah76769@gmail.com",
        "userId": "68356c67de55b80027ed7aab",
        "tags": [],
        "keywords": [],
        "colorist": "Quia voluptatibus om",
        "createdAt": "2025-05-27T09:23:05.789Z",
        "updatedAt": "2025-05-27T09:51:00.323Z",
        "__v": 0,
        "click": 1
      },
      "__v": 0
    },
    {
      "_id": "683941996b804438905de164",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "6835674f23ea2290f52ad3eb",
      "data": {
        "_id": "6835674f23ea2290f52ad3eb",
        "title": "Cupidatat qui offici",
        "description": "Omnis assumenda fugi",
        "imageUrl": "https://res.cloudinary.com/djf8l2ahy/image/upload/v1748330317/emxielwoynxhbsfc7t94.jpg",
        "youtubeLink": "Facere vel eos tene",
        "gallery": [],
        "mediaType": "Trailer",
        "genre": [
          "false"
        ],
        "releaseYear": 1993,
        "timePeriod": "Future",
        "color": [
          "Saturated",
          "Desaturated",
          "Red",
          "Orange",
          "Green",
          "Magenta",
          "Pink"
        ],
        "customColor": "In impedit blanditi",
        "aspectRatio": "1.37",
        "opticalFormat": "3D",
        "labProcess": [],
        "format": "Digital",
        "interiorExterior": "Interior",
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "Close-Up",
        "shotType": [
          "false"
        ],
        "composition": "Left Heavy",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Numquam quis est sap",
        "status": "active",
        "cinematographer": "Qui nulla eos maxim",
        "productionDesigner": "Vero anim molestias ",
        "costumeDesigner": "Magna dolorum debiti",
        "editor": [
          "Deserunt vel pariatu"
        ],
        "camera": "Rerum sunt qui volu",
        "lens": [
          "Distinctio Aut sunt"
        ],
        "shotTime": "Dolor ratione quia p",
        "set": "Pariatur A duis qui",
        "storyLocation": "Dolores in qui liber",
        "filmingLocation": "Amet culpa saepe qu",
        "actors": "Aliquip laboriosam ",
        "filmStockResolution": "Eum ex dolor accusam",
        "email": "test@gmail.com",
        "userId": "682d98178e34f7d2aea6ed6b",
        "tags": [],
        "keywords": [],
        "colorist": "Velit quisquam non a",
        "createdAt": "2025-05-27T07:18:39.490Z",
        "updatedAt": "2025-05-27T13:25:49.575Z",
        "__v": 0,
        "click": 2
      },
      "__v": 0
    },
    {
      "_id": "6839419b6b804438905de168",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "6834377629176c5c96e3eb5c",
      "data": {
        "_id": "6834377629176c5c96e3eb5c",
        "title": "Quis sunt culpa adi",
        "description": "Est in velit sed au",
        "imageUrl": "https://res.cloudinary.com/djf8l2ahy/image/upload/v1748252532/okmv6kwgrpa9kelldvi5.jpg",
        "youtubeLink": "Laboriosam laborum ",
        "gallery": [],
        "mediaType": "Movie",
        "genre": [
          "Movie/TV",
          "Music Video"
        ],
        "releaseYear": 2017,
        "timePeriod": "Medieval: 500–1499",
        "color": [
          "Warm",
          "Cool",
          "Desaturated",
          "Red",
          "Purple",
          "Magenta",
          "White",
          "Sepia",
          "Black & White"
        ],
        "customColor": "Pariatur Maiores qu",
        "aspectRatio": "1.43",
        "opticalFormat": "Anamorphic",
        "labProcess": [],
        "format": "Digital",
        "interiorExterior": "Exterior",
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "Medium Wide",
        "shotType": [
          "false"
        ],
        "composition": "Balanced",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Magni voluptatem do",
        "status": "active",
        "cinematographer": "Vel ipsum animi ex",
        "productionDesigner": "Ea est do ipsa cil",
        "costumeDesigner": "Culpa pariatur Con",
        "editor": [
          "Sit officiis aliqua"
        ],
        "camera": "Tempore magna inven",
        "lens": [
          "Sed et deserunt quos"
        ],
        "shotTime": "Aspernatur quibusdam",
        "set": "Enim ex aut aut nemo",
        "storyLocation": "Et elit autem ad pa",
        "filmingLocation": "Deserunt Nam cum nos",
        "actors": "Sit anim beatae tem",
        "filmStockResolution": "Neque iure nostrum o",
        "tags": [],
        "keywords": [],
        "colorist": "Placeat sed pariatu",
        "createdAt": "2025-05-26T09:42:14.604Z",
        "updatedAt": "2025-05-28T19:21:38.969Z",
        "__v": 0,
        "click": 7
      },
      "__v": 0
    },
    {
      "_id": "68399abfda3bacd2dc95dfb6",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "683879e8d17a3a48edc1a83b",
      "data": {
        "_id": "683879e8d17a3a48edc1a83b",
        "title": "AAAZZZEEE",
        "description": "",
        "imageUrl": null,
        "youtubeLink": "https://www.youtube.com/watch?v=XPm7zy-X_fI",
        "gallery": [],
        "mediaType": "Movie",
        "genre": [
          "false"
        ],
        "releaseYear": null,
        "timePeriod": "",
        "color": [
          "false"
        ],
        "customColor": "",
        "aspectRatio": "",
        "opticalFormat": "",
        "labProcess": [],
        "format": "",
        "interiorExterior": null,
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "",
        "shotType": [
          "false"
        ],
        "composition": "",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "",
        "status": "active",
        "cinematographer": "",
        "productionDesigner": "",
        "costumeDesigner": "",
        "editor": [
          ""
        ],
        "camera": "",
        "lens": [
          ""
        ],
        "shotTime": "",
        "set": "",
        "storyLocation": "",
        "filmingLocation": "",
        "actors": "",
        "filmStockResolution": "",
        "email": "Unknown",
        "userId": "null",
        "tags": [],
        "keywords": [],
        "colorist": "",
        "createdAt": "2025-05-29T15:14:48.480Z",
        "updatedAt": "2025-05-30T09:42:13.772Z",
        "__v": 0,
        "click": 12
      },
      "__v": 0
    },
    {
      "_id": "6839a0a533c01625adc93a71",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "683879e8d17a3a48edc1a83b",
      "data": {
        "_id": "683879e8d17a3a48edc1a83b",
        "title": "AAAZZZEEE",
        "description": "",
        "imageUrl": null,
        "youtubeLink": "https://www.youtube.com/watch?v=XPm7zy-X_fI",
        "gallery": [],
        "mediaType": "Movie",
        "genre": [
          "false"
        ],
        "releaseYear": null,
        "timePeriod": "",
        "color": [
          "false"
        ],
        "customColor": "",
        "aspectRatio": "",
        "opticalFormat": "",
        "labProcess": [],
        "format": "",
        "interiorExterior": null,
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "",
        "shotType": [
          "false"
        ],
        "composition": "",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "",
        "status": "active",
        "cinematographer": "",
        "productionDesigner": "",
        "costumeDesigner": "",
        "editor": [
          ""
        ],
        "camera": "",
        "lens": [
          ""
        ],
        "shotTime": "",
        "set": "",
        "storyLocation": "",
        "filmingLocation": "",
        "actors": "",
        "filmStockResolution": "",
        "email": "Unknown",
        "userId": "null",
        "tags": [],
        "keywords": [],
        "colorist": "",
        "createdAt": "2025-05-29T15:14:48.480Z",
        "updatedAt": "2025-05-30T12:07:09.239Z",
        "__v": 0,
        "click": 17
      },
      "__v": 0
    },
    {
      "_id": "683e172d2472d3226baf165a",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "683dfade0f0c25a24a6caf6f",
      "data": {
        "_id": "683dfade0f0c25a24a6caf6f",
        "title": "VIMEO_3",
        "description": "",
        "imageUrl": null,
        "youtubeLink": "https://vimeo.com/952260519",
        "gallery": [],
        "mediaType": "Movie",
        "genre": [
          "false"
        ],
        "releaseYear": null,
        "timePeriod": "",
        "color": [
          "false"
        ],
        "customColor": "",
        "aspectRatio": "",
        "opticalFormat": "",
        "labProcess": [],
        "format": "",
        "interiorExterior": null,
        "timeOfDay": [false],
        "gender": [
          "false"
        ],
        "age": [],
        "ethnicity": [],
        "frameSize": "",
        "shotType": [
          "false"
        ],
        "composition": "",
        "lensType": "",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "",
        "status": "active",
        "cinematographer": "",
        "productionDesigner": "",
        "costumeDesigner": "",
        "editor": [
          ""
        ],
        "camera": "",
        "lens": [
          ""
        ],
        "shotTime": "",
        "set": "",
        "storyLocation": "",
        "filmingLocation": "",
        "actors": "",
        "filmStockResolution": "",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [],
        "focalLength": [],
        "lightingConditions": [],
        "videoType": [],
        "referenceType": [],
        "videoSpeed": [],
        "videoQuality": [],
        "simulationSize": [
          "false"
        ],
        "simulationSoftware": [
          "false"
        ],
        "simulationStyle": [
          "false"
        ],
        "motionStyle": [
          "false"
        ],
        "emitterSpeed": [
          "false"
        ],
        "simulatorTypes": {
          "particles": [],
          "magicAbstract": [],
          "crowd": [],
          "mechanicsTech": [],
          "compositing": [],
          "rigidbodies": false,
          "softbodies": false,
          "clothgroom": false,
          "magicabstract": false,
          "mechanicstech": false
        },
        "timecodes": [],
        "thumbnailTimecode": [
          ""
        ],
        "keywords": [],
        "colorist": "",
        "createdAt": "2025-06-02T19:26:22.434Z",
        "updatedAt": "2025-06-02T19:26:36.083Z",
        "__v": 0,
        "click": 1
      },
      "__v": 0
    },
    {
      "_id": "683e7030686f4dea0b31b229",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": "",
      "shotId": "683e69ed104b529792b59183",
      "data": {
        "_id": "683e69ed104b529792b59183",
        "title": "Ratione beatae quos ",
        "description": "Velit minim asperio",
        "imageUrl": null,
        "youtubeLink": "https://youtu.be/ADDu-nHqQ3Q?si=A2YBpzRbePSlc3pB",
        "gallery": [],
        "mediaType": "Commercial",
        "genre": [
          "false"
        ],
        "releaseYear": 2014,
        "timePeriod": "2020s",
        "color": [
          "Red",
          "Orange",
          "Pink"
        ],
        "customColor": "In facere magnam qua",
        "aspectRatio": "2.35",
        "opticalFormat": "3 perf",
        "labProcess": [],
        "format": "Film - IMAX",
        "interiorExterior": "Interior",
        "timeOfDay": [
          "Dawn"
        ],
        "gender": [
          "false"
        ],
        "age": [],
        "ethnicity": [],
        "frameSize": "Extreme Wide",
        "shotType": [
          "Clean Single",
          "Insert"
        ],
        "composition": "Center",
        "lensType": "Ultra Wide / Fisheye",
        "lightingStyle": [
          "Low Contrast",
          "Side Light"
        ],
        "lightingType": [
          "Moonlight",
          "Firelight"
        ],
        "director": "Soluta alias nobis m",
        "status": "active",
        "cinematographer": "Et occaecat qui aut ",
        "productionDesigner": "Recusandae Id repu",
        "costumeDesigner": "Ut recusandae Obcae",
        "editor": [
          "Consectetur aut cum "
        ],
        "camera": "Exercitationem anim ",
        "lens": [
          "Et aperiam et sed au"
        ],
        "shotTime": "Eos distinctio Ut e",
        "set": "In adipisicing fugia",
        "storyLocation": "Quae consequatur Du",
        "filmingLocation": "Cupiditate repellend",
        "actors": "Dolores autem non ex",
        "filmStockResolution": "Sunt enim dolorem p",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [],
        "focalLength": [
          "Wide",
          "Medium"
        ],
        "lightingConditions": [
          "Dawn",
          "Day",
          "Night",
          "Dusk",
          "Interior"
        ],
        "videoType": [
          "Tuto"
        ],
        "referenceType": [
          "Real Video",
          "2D",
          "Live Action"
        ],
        "videoSpeed": [
          "Slow Motion"
        ],
        "videoQuality": [
          "Medium",
          "High"
        ],
        "simulationSize": [
          "extra-small",
          "small",
          "structural",
          "massive"
        ],
        "simulationSoftware": [
          "axiom",
          "real-flow",
          "fumefx",
          "krakatoa",
          "ncloth",
          "ornatrix",
          "marvelous-designer"
        ],
        "simulationStyle": [
          "realist"
        ],
        "motionStyle": [
          "anime"
        ],
        "emitterSpeed": [
          "static",
          "slow"
        ],
        "simulatorTypes": {
          "particles": [
            "Spearks",
            "Debris",
            "Snow",
            "Magic",
            "Swarns"
          ],
          "magicAbstract": [],
          "crowd": [
            "Agent Simulation",
            "Battles",
            "Swarns"
          ],
          "mechanicsTech": [],
          "compositing": [
            "Volumetrics",
            "Liquids / Fluids",
            "Particles"
          ],
          "rigidbodies": false,
          "softbodies": [
            "Muscles system",
            "Squishy Objects"
          ],
          "clothgroom": [
            "Cloth Setup",
            "Groom Setup"
          ],
          "magicabstract": [
            "Teleportation",
            "Hologram",
            "Conceptual"
          ],
          "mechanicstech": [
            "Vehicles Crash",
            "Cables / Ropes"
          ]
        },
        "timecodes": [
          {
            "label": "tar abba golir dibba",
            "time": "0:29"
          },
          {
            "label": "tar mathai smossa",
            "time": "0:44"
          },
          {
            "label": "ami niscit tar mathai somossa",
            "time": "0:49"
          }
        ],
        "thumbnailTimecode": [
          "Tempor enim saepe nu"
        ],
        "keywords": [],
        "colorist": "Eius non fugit amet",
        "createdAt": "2025-06-03T03:20:13.761Z",
        "updatedAt": "2025-06-03T03:34:03.929Z",
        "__v": 0,
        "click": 2
      },
      "__v": 0
    },
    {
      "_id": "683e7087686f4dea0b31b23e",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": "tar matha ",
      "shotId": "68352aea7e87b62015eba5cc",
      "data": {
        "focalLength": [],
        "lightingConditions": [],
        "videoType": [],
        "referenceType": [],
        "videoSpeed": [],
        "videoQuality": [],
        "simulationSize": [],
        "simulationSoftware": [],
        "simulationStyle": [],
        "motionStyle": [],
        "emitterSpeed": [],
        "timecodes": [],
        "thumbnailTimecode": [],
        "_id": "68352aea7e87b62015eba5cc",
        "title": "Nam maiores magna vo",
        "description": "Dolorum et commodo v",
        "imageUrl": "https://res.cloudinary.com/djf8l2ahy/image/upload/v1748314855/m7fncl4nrllbotodaytb.jpg",
        "youtubeLink": "Voluptatem sint ex",
        "gallery": [],
        "mediaType": "Movie",
        "genre": [
          "Movie/TV",
          "Music Video",
          "Commercial"
        ],
        "releaseYear": 2015,
        "timePeriod": "Ancient: 2000BC–500AD",
        "color": [
          "Mixed",
          "Saturated",
          "Desaturated",
          "Blue",
          "Purple",
          "Pink",
          "Sepia",
          "Black & White"
        ],
        "customColor": "Dolor quidem in labo",
        "aspectRatio": "2.39",
        "opticalFormat": "3 perf",
        "labProcess": [],
        "format": "Film - 35mm",
        "interiorExterior": "Interior",
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "Wide",
        "shotType": [
          "false"
        ],
        "composition": "Center",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Velit pariatur Obc",
        "status": "active",
        "cinematographer": "Nihil voluptatem sae",
        "productionDesigner": "Pariatur Aspernatur",
        "costumeDesigner": "Amet est aliquam l",
        "editor": [
          "Veniam et maxime qu"
        ],
        "camera": "Deleniti omnis quide",
        "lens": [
          "Voluptatem quidem l"
        ],
        "shotTime": "Et esse consequatur",
        "set": "Error accusantium id",
        "storyLocation": "Incididunt iste sint",
        "filmingLocation": "Aut est deserunt pla",
        "actors": "Labore repellendus ",
        "filmStockResolution": "Mollitia aut eiusmod",
        "email": "rakib.fbinternational@gmail.com",
        "tags": [],
        "keywords": [],
        "colorist": "Sed quia eu totam et",
        "createdAt": "2025-05-27T03:00:58.269Z",
        "updatedAt": "2025-06-02T07:11:47.002Z",
        "__v": 0,
        "click": 2
      },
      "__v": 0
    },
    {
      "_id": "683e8e73686f4dea0b31b3e1",
      "userId": "6836cee61e91e72efab5cb1a",
      "shotId": "683e69ed104b529792b59183",
      "data": {
        "_id": "683e69ed104b529792b59183",
        "title": "Ratione beatae quos ",
        "description": "Velit minim asperio",
        "imageUrl": null,
        "youtubeLink": "https://youtu.be/ADDu-nHqQ3Q?si=A2YBpzRbePSlc3pB",
        "gallery": [],
        "mediaType": "Commercial",
        "genre": [
          "false"
        ],
        "releaseYear": 2014,
        "timePeriod": "2020s",
        "color": [
          "Red",
          "Orange",
          "Pink"
        ],
        "customColor": "In facere magnam qua",
        "aspectRatio": "2.35",
        "opticalFormat": "3 perf",
        "labProcess": [],
        "format": "Film - IMAX",
        "interiorExterior": "Interior",
        "timeOfDay": [
          "Dawn"
        ],
        "gender": [
          "false"
        ],
        "age": [],
        "ethnicity": [],
        "frameSize": "Extreme Wide",
        "shotType": [
          "Clean Single",
          "Insert"
        ],
        "composition": "Center",
        "lensType": "Ultra Wide / Fisheye",
        "lightingStyle": [
          "Low Contrast",
          "Side Light"
        ],
        "lightingType": [
          "Moonlight",
          "Firelight"
        ],
        "director": "Soluta alias nobis m",
        "status": "active",
        "cinematographer": "Et occaecat qui aut ",
        "productionDesigner": "Recusandae Id repu",
        "costumeDesigner": "Ut recusandae Obcae",
        "editor": [
          "Consectetur aut cum "
        ],
        "camera": "Exercitationem anim ",
        "lens": [
          "Et aperiam et sed au"
        ],
        "shotTime": "Eos distinctio Ut e",
        "set": "In adipisicing fugia",
        "storyLocation": "Quae consequatur Du",
        "filmingLocation": "Cupiditate repellend",
        "actors": "Dolores autem non ex",
        "filmStockResolution": "Sunt enim dolorem p",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [],
        "focalLength": [
          "Wide",
          "Medium"
        ],
        "lightingConditions": [
          "Dawn",
          "Day",
          "Night",
          "Dusk",
          "Interior"
        ],
        "videoType": [
          "Tuto"
        ],
        "referenceType": [
          "Real Video",
          "2D",
          "Live Action"
        ],
        "videoSpeed": [
          "Slow Motion"
        ],
        "videoQuality": [
          "Medium",
          "High"
        ],
        "simulationSize": [
          "extra-small",
          "small",
          "structural",
          "massive"
        ],
        "simulationSoftware": [
          "axiom",
          "real-flow",
          "fumefx",
          "krakatoa",
          "ncloth",
          "ornatrix",
          "marvelous-designer"
        ],
        "simulationStyle": [
          "realist"
        ],
        "motionStyle": [
          "anime"
        ],
        "emitterSpeed": [
          "static",
          "slow"
        ],
        "simulatorTypes": {
          "particles": [
            "Spearks",
            "Debris",
            "Snow",
            "Magic",
            "Swarns"
          ],
          "magicAbstract": [],
          "crowd": [
            "Agent Simulation",
            "Battles",
            "Swarns"
          ],
          "mechanicsTech": [],
          "compositing": [
            "Volumetrics",
            "Liquids / Fluids",
            "Particles"
          ],
          "rigidbodies": false,
          "softbodies": [
            "Muscles system",
            "Squishy Objects"
          ],
          "clothgroom": [
            "Cloth Setup",
            "Groom Setup"
          ],
          "magicabstract": [
            "Teleportation",
            "Hologram",
            "Conceptual"
          ],
          "mechanicstech": [
            "Vehicles Crash",
            "Cables / Ropes"
          ]
        },
        "timecodes": [
          {
            "label": "tar abba golir dibba",
            "time": "0:29"
          },
          {
            "label": "tar mathai smossa",
            "time": "0:44"
          },
          {
            "label": "ami niscit tar mathai somossa",
            "time": "0:49"
          }
        ],
        "thumbnailTimecode": [
          "Tempor enim saepe nu"
        ],
        "keywords": [],
        "colorist": "Eius non fugit amet",
        "createdAt": "2025-06-03T03:20:13.761Z",
        "updatedAt": "2025-06-03T05:28:31.613Z",
        "__v": 0,
        "click": 11
      },
      "__v": 0
    },
    {
      "_id": "683ec3a0da1ce76160b6bbc8",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": "Tomi ar ami",
      "shotId": "68388d0d9317fef0804d21ff",
      "data": {
        "focalLength": [],
        "lightingConditions": [],
        "videoType": [],
        "referenceType": [],
        "videoSpeed": [],
        "videoQuality": [],
        "simulationSize": [],
        "simulationSoftware": [],
        "simulationStyle": [],
        "motionStyle": [],
        "emitterSpeed": [],
        "timecodes": [],
        "thumbnailTimecode": [],
        "_id": "68388d0d9317fef0804d21ff",
        "title": "SHORT_TEST",
        "description": "",
        "imageUrl": null,
        "youtubeLink": "https://youtube.com/shorts/Ixjmj3eqxcc?si=zfB2w2mxaEyg8MsI",
        "gallery": [],
        "mediaType": "Movie",
        "genre": [
          "Movie/TV"
        ],
        "releaseYear": null,
        "timePeriod": "",
        "color": [
          "false"
        ],
        "customColor": "",
        "aspectRatio": "",
        "opticalFormat": "",
        "labProcess": [],
        "format": "",
        "interiorExterior": null,
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "",
        "shotType": [
          "false"
        ],
        "composition": "",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "",
        "status": "active",
        "cinematographer": "",
        "productionDesigner": "",
        "costumeDesigner": "",
        "editor": [
          ""
        ],
        "camera": "",
        "lens": [
          ""
        ],
        "shotTime": "",
        "set": "",
        "storyLocation": "",
        "filmingLocation": "",
        "actors": "",
        "filmStockResolution": "",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [],
        "keywords": [],
        "colorist": "",
        "createdAt": "2025-05-29T16:36:29.582Z",
        "updatedAt": "2025-06-03T03:57:59.037Z",
        "__v": 0,
        "click": 17
      },
      "__v": 0
    },
    {
      "_id": "683ec3d2da1ce76160b6bbda",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": null,
      "shotId": "6839984984933e984461138a",
      "data": {
        "focalLength": [],
        "lightingConditions": [],
        "videoType": [],
        "referenceType": [],
        "videoSpeed": [],
        "videoQuality": [],
        "simulationSize": [],
        "simulationSoftware": [],
        "simulationStyle": [],
        "motionStyle": [],
        "emitterSpeed": [],
        "timecodes": [],
        "thumbnailTimecode": [],
        "_id": "6839984984933e984461138a",
        "title": "VIMEO",
        "description": "",
        "imageUrl": null,
        "youtubeLink": "https://vimeo.com/952260519",
        "gallery": [],
        "mediaType": "TV",
        "genre": [
          "false"
        ],
        "releaseYear": null,
        "timePeriod": "",
        "color": [
          "false"
        ],
        "customColor": "",
        "aspectRatio": "",
        "opticalFormat": "",
        "labProcess": [],
        "format": "",
        "interiorExterior": null,
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "",
        "shotType": [
          "false"
        ],
        "composition": "",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "",
        "status": "active",
        "cinematographer": "",
        "productionDesigner": "",
        "costumeDesigner": "",
        "editor": [
          ""
        ],
        "camera": "",
        "lens": [
          ""
        ],
        "shotTime": "",
        "set": "",
        "storyLocation": "",
        "filmingLocation": "",
        "actors": "",
        "filmStockResolution": "",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [],
        "keywords": [],
        "colorist": "",
        "createdAt": "2025-05-30T11:36:41.781Z",
        "updatedAt": "2025-06-02T19:20:39.821Z",
        "__v": 0,
        "click": 6
      },
      "__v": 0
    },
    {
      "_id": "683ec3d6da1ce76160b6bbdd",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": "kolimoddin",
      "shotId": "6839984984933e984461138a",
      "data": {
        "focalLength": [],
        "lightingConditions": [],
        "videoType": [],
        "referenceType": [],
        "videoSpeed": [],
        "videoQuality": [],
        "simulationSize": [],
        "simulationSoftware": [],
        "simulationStyle": [],
        "motionStyle": [],
        "emitterSpeed": [],
        "timecodes": [],
        "thumbnailTimecode": [],
        "_id": "6839984984933e984461138a",
        "title": "VIMEO",
        "description": "",
        "imageUrl": null,
        "youtubeLink": "https://vimeo.com/952260519",
        "gallery": [],
        "mediaType": "TV",
        "genre": [
          "false"
        ],
        "releaseYear": null,
        "timePeriod": "",
        "color": [
          "false"
        ],
        "customColor": "",
        "aspectRatio": "",
        "opticalFormat": "",
        "labProcess": [],
        "format": "",
        "interiorExterior": null,
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "",
        "shotType": [
          "false"
        ],
        "composition": "",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "",
        "status": "active",
        "cinematographer": "",
        "productionDesigner": "",
        "costumeDesigner": "",
        "editor": [
          ""
        ],
        "camera": "",
        "lens": [
          ""
        ],
        "shotTime": "",
        "set": "",
        "storyLocation": "",
        "filmingLocation": "",
        "actors": "",
        "filmStockResolution": "",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [],
        "keywords": [],
        "colorist": "",
        "createdAt": "2025-05-30T11:36:41.781Z",
        "updatedAt": "2025-06-02T19:20:39.821Z",
        "__v": 0,
        "click": 6
      },
      "__v": 0
    },
    {
      "_id": "683ec3e9da1ce76160b6bbea",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": "kolimoddin",
      "shotId": "683e8085686f4dea0b31b30c",
      "data": {
        "_id": "683e8085686f4dea0b31b30c",
        "title": "Magni explicabo Dig",
        "description": "Officia error molest",
        "imageUrl": null,
        "youtubeLink": "https://youtu.be/SvfKo6hv7Js?si=dP9e7CreWAHfhOda",
        "gallery": [],
        "mediaType": "Movie",
        "genre": [
          "false"
        ],
        "releaseYear": 2003,
        "timePeriod": "2000s",
        "color": [
          "false"
        ],
        "customColor": "Cumque omnis omnis n",
        "aspectRatio": "1.85",
        "opticalFormat": "3 perf",
        "labProcess": [],
        "format": "Film - 65mm",
        "interiorExterior": "Interior",
        "timeOfDay": [false],
        "gender": [
          "false"
        ],
        "age": [],
        "ethnicity": [],
        "frameSize": "Extreme Close-Up",
        "shotType": [
          "false"
        ],
        "composition": "Center",
        "lensType": "Long Lens",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Similique nemo provi",
        "status": "active",
        "cinematographer": "Et quia ab voluptate",
        "productionDesigner": "Qui illo tempor cons",
        "costumeDesigner": "Harum delectus omni",
        "editor": [
          "Mollitia similique t"
        ],
        "camera": "Corrupti id enim ne",
        "lens": [
          "Nulla voluptatem per"
        ],
        "shotTime": "Dolores sint iste in",
        "set": "Deserunt in ut esse ",
        "storyLocation": "Omnis et commodo sun",
        "filmingLocation": "Adipisci ullam error",
        "actors": "Vel quam ut earum ve",
        "filmStockResolution": "Tenetur fugit in ad",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [],
        "focalLength": [
          "Wide",
          "Long",
          "Telephoto"
        ],
        "lightingConditions": [
          "Dawn",
          "Day",
          "Night",
          "Dusk",
          "Interior"
        ],
        "videoType": [
          "Reference",
          "Tuto"
        ],
        "referenceType": [],
        "videoSpeed": [
          "Normal",
          "Accelerated"
        ],
        "videoQuality": [],
        "simulationSize": [
          "extra-small",
          "massive"
        ],
        "simulationSoftware": [
          "blender",
          "ncloth",
          "ornatrix",
          "ue5-niagara"
        ],
        "simulationStyle": [
          "realist",
          "anime"
        ],
        "motionStyle": [
          "realist",
          "stylized"
        ],
        "emitterSpeed": [
          "slow"
        ],
        "simulatorTypes": {
          "particles": [
            "Debris",
            "Magic"
          ],
          "magicAbstract": [],
          "crowd": [
            "Agent Simulation",
            "Crowd Dynamics"
          ],
          "mechanicsTech": [],
          "compositing": [],
          "rigidbodies": [
            "Breaking",
            "Falling Objects"
          ],
          "softbodies": [
            "Muscles system",
            "Anatomical deformation",
            "Squishy Objects"
          ],
          "clothgroom": [
            "Cloth Setup",
            "Groom Dynamics"
          ],
          "magicabstract": [
            "Plasma",
            "Teleportation"
          ],
          "mechanicstech": [
            "Vehicles Crash",
            "Mechanical Parts"
          ]
        },
        "timecodes": [
          {
            "label": "kretar matha nosto",
            "time": "0:11"
          },
          {
            "label": "kretar cikissa dorakar",
            "time": "0:20"
          },
          {
            "label": "kretar mirgi beram ase",
            "time": "0:30"
          },
          {
            "label": "kretar brain e somossa ace",
            "time": "0:50"
          }
        ],
        "thumbnailTimecode": [
          "0:11"
        ],
        "keywords": [],
        "colorist": "Sunt dolorem tempor ",
        "createdAt": "2025-06-03T04:56:37.198Z",
        "updatedAt": "2025-06-03T05:00:56.819Z",
        "__v": 0,
        "click": 1
      },
      "__v": 0
    },
    {
      "_id": "683ec633edf30fac4833c364",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": "kolimoddin",
      "shotId": "683e81c5686f4dea0b31b31b",
      "data": {
        "_id": "683e81c5686f4dea0b31b31b",
        "title": "Nisi tenetur omnis q",
        "description": "A ducimus ea dicta ",
        "imageUrl": null,
        "youtubeLink": "https://youtu.be/h4AuPA-wdq8?si=9UPz8h_VOXloWOZa",
        "gallery": [],
        "mediaType": "Music Video",
        "genre": [
          "false"
        ],
        "releaseYear": 1982,
        "timePeriod": "1700s",
        "color": [
          "false"
        ],
        "customColor": "Et incididunt eligen",
        "aspectRatio": "1.66",
        "opticalFormat": "3 perf",
        "labProcess": [],
        "format": "Digital",
        "interiorExterior": "Interior",
        "timeOfDay": [false],
        "gender": [
          "false"
        ],
        "age": [],
        "ethnicity": [],
        "frameSize": "Medium Wide",
        "shotType": [
          "false"
        ],
        "composition": "Balanced",
        "lensType": "Medium",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Voluptas culpa velit",
        "status": "active",
        "cinematographer": "Velit in quo eiusmod",
        "productionDesigner": "Ut cumque deserunt e",
        "costumeDesigner": "Recusandae Laboris ",
        "editor": [
          "Officia et omnis ius"
        ],
        "camera": "Distinctio Commodi ",
        "lens": [
          "Nihil necessitatibus"
        ],
        "shotTime": "Deleniti facilis ut ",
        "set": "Reiciendis autem vol",
        "storyLocation": "Aut neque consequatu",
        "filmingLocation": "In ex lorem lorem si",
        "actors": "Optio eiusmod quia ",
        "filmStockResolution": "Soluta velit eos ut ",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [],
        "focalLength": [
          "Ultra Wide",
          "Wide",
          "Medium",
          "Telephoto"
        ],
        "lightingConditions": [
          "Dawn",
          "Day",
          "Night",
          "Dusk",
          "Interior"
        ],
        "videoType": [
          "Reference",
          "Breakdown"
        ],
        "referenceType": [
          "Real Video"
        ],
        "videoSpeed": [
          "Slow Motion"
        ],
        "videoQuality": [
          "High"
        ],
        "simulationSize": [
          "extra-small",
          "small",
          "structural",
          "massive"
        ],
        "simulationSoftware": [
          "houdini",
          "blender",
          "embergen",
          "real-flow",
          "x-particles",
          "krakatoa",
          "ncloth",
          "marvelous-designer",
          "ue5-niagara"
        ],
        "simulationStyle": [
          "semi-stylized",
          "stylized",
          "anime"
        ],
        "motionStyle": [
          "stylized",
          "anime"
        ],
        "emitterSpeed": [
          "static",
          "slow"
        ],
        "simulatorTypes": {
          "particles": [
            "Rain",
            "Ashes"
          ],
          "magicAbstract": [],
          "crowd": [
            "Swarns"
          ],
          "mechanicsTech": [],
          "compositing": [
            "Liquids / Fluids"
          ],
          "rigidbodies": [
            "Destruction"
          ],
          "softbodies": [
            "Anatomical deformation",
            "Squishy Objects"
          ],
          "clothgroom": [
            "Groom Dynamics"
          ],
          "magicabstract": [
            "Teleportation",
            "Glitches",
            "Hologram"
          ],
          "mechanicstech": false
        },
        "timecodes": [],
        "thumbnailTimecode": [
          "9:30"
        ],
        "keywords": [],
        "colorist": "Esse velit enim ad ",
        "createdAt": "2025-06-03T05:01:57.858Z",
        "updatedAt": "2025-06-03T06:52:10.720Z",
        "__v": 0,
        "click": 3
      },
      "__v": 0
    },
    {
      "_id": "683ec635edf30fac4833c367",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": "kolimoddin",
      "shotId": "683e81c5686f4dea0b31b31b",
      "data": {
        "_id": "683e81c5686f4dea0b31b31b",
        "title": "Nisi tenetur omnis q",
        "description": "A ducimus ea dicta ",
        "imageUrl": null,
        "youtubeLink": "https://youtu.be/h4AuPA-wdq8?si=9UPz8h_VOXloWOZa",
        "gallery": [],
        "mediaType": "Music Video",
        "genre": [
          "false"
        ],
        "releaseYear": 1982,
        "timePeriod": "1700s",
        "color": [
          "false"
        ],
        "customColor": "Et incididunt eligen",
        "aspectRatio": "1.66",
        "opticalFormat": "3 perf",
        "labProcess": [],
        "format": "Digital",
        "interiorExterior": "Interior",
        "timeOfDay": [false],
        "gender": [
          "false"
        ],
        "age": [],
        "ethnicity": [],
        "frameSize": "Medium Wide",
        "shotType": [
          "false"
        ],
        "composition": "Balanced",
        "lensType": "Medium",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Voluptas culpa velit",
        "status": "active",
        "cinematographer": "Velit in quo eiusmod",
        "productionDesigner": "Ut cumque deserunt e",
        "costumeDesigner": "Recusandae Laboris ",
        "editor": [
          "Officia et omnis ius"
        ],
        "camera": "Distinctio Commodi ",
        "lens": [
          "Nihil necessitatibus"
        ],
        "shotTime": "Deleniti facilis ut ",
        "set": "Reiciendis autem vol",
        "storyLocation": "Aut neque consequatu",
        "filmingLocation": "In ex lorem lorem si",
        "actors": "Optio eiusmod quia ",
        "filmStockResolution": "Soluta velit eos ut ",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [],
        "focalLength": [
          "Ultra Wide",
          "Wide",
          "Medium",
          "Telephoto"
        ],
        "lightingConditions": [
          "Dawn",
          "Day",
          "Night",
          "Dusk",
          "Interior"
        ],
        "videoType": [
          "Reference",
          "Breakdown"
        ],
        "referenceType": [
          "Real Video"
        ],
        "videoSpeed": [
          "Slow Motion"
        ],
        "videoQuality": [
          "High"
        ],
        "simulationSize": [
          "extra-small",
          "small",
          "structural",
          "massive"
        ],
        "simulationSoftware": [
          "houdini",
          "blender",
          "embergen",
          "real-flow",
          "x-particles",
          "krakatoa",
          "ncloth",
          "marvelous-designer",
          "ue5-niagara"
        ],
        "simulationStyle": [
          "semi-stylized",
          "stylized",
          "anime"
        ],
        "motionStyle": [
          "stylized",
          "anime"
        ],
        "emitterSpeed": [
          "static",
          "slow"
        ],
        "simulatorTypes": {
          "particles": [
            "Rain",
            "Ashes"
          ],
          "magicAbstract": [],
          "crowd": [
            "Swarns"
          ],
          "mechanicsTech": [],
          "compositing": [
            "Liquids / Fluids"
          ],
          "rigidbodies": [
            "Destruction"
          ],
          "softbodies": [
            "Anatomical deformation",
            "Squishy Objects"
          ],
          "clothgroom": [
            "Groom Dynamics"
          ],
          "magicabstract": [
            "Teleportation",
            "Glitches",
            "Hologram"
          ],
          "mechanicstech": false
        },
        "timecodes": [],
        "thumbnailTimecode": [
          "9:30"
        ],
        "keywords": [],
        "colorist": "Esse velit enim ad ",
        "createdAt": "2025-06-03T05:01:57.858Z",
        "updatedAt": "2025-06-03T06:52:10.720Z",
        "__v": 0,
        "click": 3
      },
      "__v": 0
    },
    {
      "_id": "683ec639edf30fac4833c36a",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": "Jamat islam",
      "shotId": "683e81c5686f4dea0b31b31b",
      "data": {
        "_id": "683e81c5686f4dea0b31b31b",
        "title": "Nisi tenetur omnis q",
        "description": "A ducimus ea dicta ",
        "imageUrl": null,
        "youtubeLink": "https://youtu.be/h4AuPA-wdq8?si=9UPz8h_VOXloWOZa",
        "gallery": [],
        "mediaType": "Music Video",
        "genre": [
          "false"
        ],
        "releaseYear": 1982,
        "timePeriod": "1700s",
        "color": [
          "false"
        ],
        "customColor": "Et incididunt eligen",
        "aspectRatio": "1.66",
        "opticalFormat": "3 perf",
        "labProcess": [],
        "format": "Digital",
        "interiorExterior": "Interior",
        "timeOfDay": [false],
        "gender": [
          "false"
        ],
        "age": [],
        "ethnicity": [],
        "frameSize": "Medium Wide",
        "shotType": [
          "false"
        ],
        "composition": "Balanced",
        "lensType": "Medium",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Voluptas culpa velit",
        "status": "active",
        "cinematographer": "Velit in quo eiusmod",
        "productionDesigner": "Ut cumque deserunt e",
        "costumeDesigner": "Recusandae Laboris ",
        "editor": [
          "Officia et omnis ius"
        ],
        "camera": "Distinctio Commodi ",
        "lens": [
          "Nihil necessitatibus"
        ],
        "shotTime": "Deleniti facilis ut ",
        "set": "Reiciendis autem vol",
        "storyLocation": "Aut neque consequatu",
        "filmingLocation": "In ex lorem lorem si",
        "actors": "Optio eiusmod quia ",
        "filmStockResolution": "Soluta velit eos ut ",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [],
        "focalLength": [
          "Ultra Wide",
          "Wide",
          "Medium",
          "Telephoto"
        ],
        "lightingConditions": [
          "Dawn",
          "Day",
          "Night",
          "Dusk",
          "Interior"
        ],
        "videoType": [
          "Reference",
          "Breakdown"
        ],
        "referenceType": [
          "Real Video"
        ],
        "videoSpeed": [
          "Slow Motion"
        ],
        "videoQuality": [
          "High"
        ],
        "simulationSize": [
          "extra-small",
          "small",
          "structural",
          "massive"
        ],
        "simulationSoftware": [
          "houdini",
          "blender",
          "embergen",
          "real-flow",
          "x-particles",
          "krakatoa",
          "ncloth",
          "marvelous-designer",
          "ue5-niagara"
        ],
        "simulationStyle": [
          "semi-stylized",
          "stylized",
          "anime"
        ],
        "motionStyle": [
          "stylized",
          "anime"
        ],
        "emitterSpeed": [
          "static",
          "slow"
        ],
        "simulatorTypes": {
          "particles": [
            "Rain",
            "Ashes"
          ],
          "magicAbstract": [],
          "crowd": [
            "Swarns"
          ],
          "mechanicsTech": [],
          "compositing": [
            "Liquids / Fluids"
          ],
          "rigidbodies": [
            "Destruction"
          ],
          "softbodies": [
            "Anatomical deformation",
            "Squishy Objects"
          ],
          "clothgroom": [
            "Groom Dynamics"
          ],
          "magicabstract": [
            "Teleportation",
            "Glitches",
            "Hologram"
          ],
          "mechanicstech": false
        },
        "timecodes": [],
        "thumbnailTimecode": [
          "9:30"
        ],
        "keywords": [],
        "colorist": "Esse velit enim ad ",
        "createdAt": "2025-06-03T05:01:57.858Z",
        "updatedAt": "2025-06-03T06:52:10.720Z",
        "__v": 0,
        "click": 3
      },
      "__v": 0
    },
    {
      "_id": "683ec643edf30fac4833c36e",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": "Jamat islam",
      "shotId": "683e7153686f4dea0b31b245",
      "data": {
        "_id": "683e7153686f4dea0b31b245",
        "title": "Rem sit deleniti vel",
        "description": "Vel eum quo veniam ",
        "imageUrl": null,
        "youtubeLink": "https://vimeo.com/336812686",
        "gallery": [],
        "mediaType": "Commercial",
        "genre": [
          "false"
        ],
        "releaseYear": 2000,
        "timePeriod": "2000s",
        "color": [
          "false"
        ],
        "customColor": "Officia sed voluptas",
        "aspectRatio": "2.67",
        "opticalFormat": "Super 35",
        "labProcess": [],
        "format": "Film - IMAX",
        "interiorExterior": "Exterior",
        "timeOfDay": [false],
        "gender": [
          "false"
        ],
        "age": [],
        "ethnicity": [],
        "frameSize": "Medium Close-Up",
        "shotType": [
          "false"
        ],
        "composition": "Left Heavy",
        "lensType": "Medium",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Commodi illum facer",
        "status": "active",
        "cinematographer": "Corrupti dolorem ne",
        "productionDesigner": "Labore dolor consequ",
        "costumeDesigner": "Quae sint sed ut qui",
        "editor": [
          "Dolor dolor aut offi"
        ],
        "camera": "Deserunt deserunt do",
        "lens": [
          "Vel hic dolor libero"
        ],
        "shotTime": "Laborum animi volup",
        "set": "Labore voluptatem vo",
        "storyLocation": "Eum et cumque occaec",
        "filmingLocation": "Commodo est qui mol",
        "actors": "Dolorem aut voluptat",
        "filmStockResolution": "Mollitia mollitia au",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [],
        "focalLength": [
          "Wide"
        ],
        "lightingConditions": [
          "Dawn",
          "Day",
          "Night",
          "Dusk",
          "Interior"
        ],
        "videoType": [
          "Reference",
          "Tuto",
          "Breakdown"
        ],
        "referenceType": [
          "3D",
          "Live Action"
        ],
        "videoSpeed": [
          "Normal"
        ],
        "videoQuality": [
          "Medium",
          "High"
        ],
        "simulationSize": [
          "extra-small",
          "structural"
        ],
        "simulationSoftware": [
          "houdini",
          "blender",
          "real-flow",
          "fumefx",
          "ornatrix",
          "marvelous-designer"
        ],
        "simulationStyle": [
          "semi-stylized",
          "anime"
        ],
        "motionStyle": [
          "stylized",
          "anime"
        ],
        "emitterSpeed": [
          "static",
          "fast"
        ],
        "simulatorTypes": {
          "particles": [
            "Spearks",
            "Snow",
            "Magic",
            "Swarns"
          ],
          "magicAbstract": [],
          "crowd": [
            "Agent Simulation"
          ],
          "mechanicsTech": [],
          "compositing": [
            "Volumetrics",
            "Base of FX compositing"
          ],
          "rigidbodies": [
            "Destruction",
            "Breaking"
          ],
          "softbodies": [
            "Muscles system",
            "Anatomical deformation"
          ],
          "clothgroom": [
            "Cloth Dynamics"
          ],
          "magicabstract": [
            "Energy FX",
            "Plasma",
            "Portals",
            "Hologram"
          ],
          "mechanicstech": [
            "Cables / Ropes"
          ]
        },
        "timecodes": [
          {
            "label": "tar abba golir dibba",
            "time": "0:11"
          },
          {
            "label": "tar nanar matha",
            "time": "0:22"
          },
          {
            "label": "tahar mathar gal",
            "time": "0:28"
          }
        ],
        "thumbnailTimecode": [
          "Id velit cillum eum"
        ],
        "keywords": [],
        "colorist": "Voluptas et velit do",
        "createdAt": "2025-06-03T03:51:47.210Z",
        "updatedAt": "2025-06-03T04:29:02.662Z",
        "__v": 0,
        "click": 11
      },
      "__v": 0
    },
    {
      "_id": "683ec78a6b2723753cd5064a",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": "kolimoddin",
      "shotId": "683586d6601a79daf8be29dd",
      "data": {
        "focalLength": [],
        "lightingConditions": [],
        "videoType": [],
        "referenceType": [],
        "videoSpeed": [],
        "videoQuality": [],
        "simulationSize": [],
        "simulationSoftware": [],
        "simulationStyle": [],
        "motionStyle": [],
        "emitterSpeed": [],
        "timecodes": [],
        "thumbnailTimecode": [],
        "_id": "683586d6601a79daf8be29dd",
        "title": "Excepturi natus volu",
        "description": "Est voluptatem Expl",
        "imageUrl": "https://res.cloudinary.com/djf8l2ahy/image/upload/v1748338389/jbi6rmjgltygd7e4cdmq.jpg",
        "youtubeLink": "https://youtu.be/YiSQ_db-Dcw?si=jzKUKxw3BAJ5_Gji",
        "gallery": [],
        "mediaType": "Commercial",
        "genre": [
          "Music Video"
        ],
        "releaseYear": 2013,
        "timePeriod": "1900s",
        "color": [
          "Warm",
          "Cool",
          "Mixed",
          "Saturated",
          "Desaturated",
          "Orange",
          "Yellow",
          "Blue",
          "Purple",
          "Magenta",
          "Sepia"
        ],
        "customColor": "Est eos autem itaque",
        "aspectRatio": "2.76",
        "opticalFormat": "Anamorphic",
        "labProcess": [],
        "format": "Animation",
        "interiorExterior": "Interior",
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "Extreme Wide",
        "shotType": [
          "false"
        ],
        "composition": "Symmetrical",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Temporibus ipsa vel",
        "status": "active",
        "cinematographer": "Vel sapiente reprehe",
        "productionDesigner": "Ut nulla consectetur",
        "costumeDesigner": "Modi alias non omnis",
        "editor": [
          "Qui voluptatibus et "
        ],
        "camera": "Quam veniam labore ",
        "lens": [
          "Elit consectetur v"
        ],
        "shotTime": "Est et reprehenderi",
        "set": "Debitis laboris laud",
        "storyLocation": "Excepturi ea pariatu",
        "filmingLocation": "Accusantium deserunt",
        "actors": "Quae tempore tempor",
        "filmStockResolution": "Facere impedit aut ",
        "email": "bannah76769@gmail.com",
        "userId": "68356c67de55b80027ed7aab",
        "tags": [],
        "keywords": [],
        "colorist": "Suscipit quis tenetu",
        "createdAt": "2025-05-27T09:33:10.818Z",
        "updatedAt": "2025-05-30T12:56:11.951Z",
        "__v": 0,
        "click": 7
      },
      "__v": 0
    },
    {
      "_id": "683ecb189293fece5ab2d4a1",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": "kolimoddin",
      "shotId": "683d30755295fee65002370e",
      "data": {
        "_id": "683d30755295fee65002370e",
        "title": "Est quia eum autem q",
        "description": "Aut est aliquid proi",
        "imageUrl": null,
        "youtubeLink": "https://res.cloudinary.com/djf8l2ahy/video/upload/v1748840552/cu8k9vcybevk79qkttj1.mp4",
        "gallery": [],
        "mediaType": "Trailer",
        "genre": [
          "false"
        ],
        "releaseYear": 2000,
        "timePeriod": "Future",
        "color": [
          "false"
        ],
        "customColor": "Quis voluptas adipis",
        "aspectRatio": "2.39",
        "opticalFormat": "3D",
        "labProcess": [],
        "format": "Film - 65mm",
        "interiorExterior": "Interior",
        "timeOfDay": [false],
        "gender": [],
        "age": [],
        "ethnicity": [],
        "frameSize": "Wide",
        "shotType": [
          "false"
        ],
        "composition": "Left Heavy",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "Est nemo omnis autem",
        "status": "active",
        "cinematographer": "Ullamco sit quae cu",
        "productionDesigner": "Eaque qui ut aut nis",
        "costumeDesigner": "Adipisci numquam cul",
        "editor": [
          "Minima in a a omnis "
        ],
        "camera": "Odio qui necessitati",
        "lens": [
          "Voluptatum quia earu"
        ],
        "shotTime": "Qui error et libero ",
        "set": "Vitae nesciunt dele",
        "storyLocation": "Ex sit sed accusamus",
        "filmingLocation": "Voluptas aperiam id ",
        "actors": "Rerum et et enim ut ",
        "filmStockResolution": "Dolore est sunt dol",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [
          "Select A Option"
        ],
        "focalLength": [
          "Ultra Wide",
          "Medium",
          "Telephoto"
        ],
        "lightingConditions": [
          "Dawn",
          "Day",
          "Night",
          "Dusk",
          "Interior"
        ],
        "videoType": [
          "Reference",
          "Tuto"
        ],
        "referenceType": [
          "2D",
          "3D",
          "Full CGI"
        ],
        "videoSpeed": [
          "Normal",
          "Accelerated"
        ],
        "videoQuality": [
          "Low",
          "High"
        ],
        "simulationSize": [
          "structural",
          "massive"
        ],
        "simulationSoftware": [
          "real-flow",
          "phoenix-fd",
          "x-particles",
          "krakatoa",
          "yeti",
          "ornatrix",
          "marvelous-designer"
        ],
        "simulationStyle": [
          "realist",
          "anime"
        ],
        "motionStyle": [
          "anime"
        ],
        "emitterSpeed": [
          "slow",
          "fast"
        ],
        "simulatorTypes": {
          "particles": [
            "Snow",
            "Swarns"
          ],
          "magicAbstract": [],
          "crowd": [
            "Agent Simulation",
            "Crowd Dynamics",
            "Battles",
            "Swarns"
          ],
          "mechanicsTech": [],
          "compositing": [
            "Base of FX compositing"
          ],
          "rigidbodies": [
            "Impact",
            "Falling Objects"
          ],
          "softbodies": [
            "Muscles system",
            "Anatomical deformation",
            "Squishy Objects"
          ],
          "clothgroom": [
            "Cloth Setup",
            "Cloth Dynamics",
            "Groom Setup",
            "Groom Dynamics"
          ],
          "magicabstract": [
            "Energy FX",
            "Glitches",
            "Hologram",
            "Conceptual"
          ],
          "mechanicstech": [
            "Vehicles Crash",
            "Mechanical Parts"
          ]
        },
        "timecodes": [],
        "thumbnailTimecode": [
          "Sunt aut quo irure q"
        ],
        "keywords": [],
        "colorist": "Neque voluptatem au",
        "createdAt": "2025-06-02T05:02:45.106Z",
        "updatedAt": "2025-06-03T04:08:04.083Z",
        "__v": 0,
        "click": 5
      },
      "__v": 0
    },
    {
      "_id": "683ecc809293fece5ab2d4c0",
      "userId": "6836cee61e91e72efab5cb1a",
      "collectionName": "NCP",
      "shotId": "683e873f686f4dea0b31b34f",
      "data": {
        "_id": "683e873f686f4dea0b31b34f",
        "title": "test",
        "description": "adsf",
        "imageUrl": null,
        "youtubeLink": "https://vimeo.com/336812686",
        "gallery": [],
        "mediaType": "TV",
        "genre": [
          "false"
        ],
        "releaseYear": null,
        "timePeriod": "",
        "color": [
          "false"
        ],
        "customColor": "",
        "aspectRatio": "",
        "opticalFormat": "",
        "labProcess": [],
        "format": "",
        "interiorExterior": null,
        "timeOfDay": [false],
        "gender": [
          "false"
        ],
        "age": [],
        "ethnicity": [],
        "frameSize": "",
        "shotType": [
          "false"
        ],
        "composition": "",
        "lensType": "",
        "lightingStyle": [
          "false"
        ],
        "lightingType": [
          "false"
        ],
        "director": "",
        "status": "active",
        "cinematographer": "",
        "productionDesigner": "",
        "costumeDesigner": "",
        "editor": [
          ""
        ],
        "camera": "",
        "lens": [
          ""
        ],
        "shotTime": "",
        "set": "",
        "storyLocation": "",
        "filmingLocation": "",
        "actors": "",
        "filmStockResolution": "",
        "email": "test1@gmail.com",
        "userId": "6836cee61e91e72efab5cb1a",
        "tags": [
          "dsaf"
        ],
        "focalLength": [],
        "lightingConditions": [],
        "videoType": [],
        "referenceType": [],
        "videoSpeed": [],
        "videoQuality": [],
        "simulationSize": [
          "false"
        ],
        "simulationSoftware": [
          "false"
        ],
        "simulationStyle": [
          "false"
        ],
        "motionStyle": [
          "false"
        ],
        "emitterSpeed": [
          "false"
        ],
        "simulatorTypes": {
          "particles": [],
          "magicAbstract": [],
          "crowd": [],
          "mechanicsTech": [],
          "compositing": [],
          "rigidbodies": false,
          "softbodies": false,
          "clothgroom": false,
          "magicabstract": false,
          "mechanicstech": false
        },
        "timecodes": [],
        "thumbnailTimecode": [
          "0:24"
        ],
        "keywords": [],
        "colorist": "",
        "createdAt": "2025-06-03T05:25:19.268Z",
        "updatedAt": "2025-06-03T10:06:54.320Z",
        "__v": 0,
        "click": 1
      },
      "__v": 0
    }
  ]
}


// ekhane tomi ekta kaj koro.ekhane to add to collection ase.ata na kore just akta flag icon daw.