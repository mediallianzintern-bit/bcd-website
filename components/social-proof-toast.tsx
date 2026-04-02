"use client"

import { useEffect, useState } from "react"
import { ShoppingBag, UserCheck } from "lucide-react"

const NAMES = [
  // Original
  "Parth", "Priya", "Rahul", "Sneha", "Amit", "Neha", "Rohan", "Anjali", "Vikram", "Divya",
  "Arjun", "Pooja", "Karan", "Meera", "Raj", "Simran", "Aditya", "Nisha", "Siddharth", "Kavita",
  // Added — Male
  "Vipin", "Sahil", "Tejas", "Bharat", "Shubham", "Sandeep", "Ayush", "Dhruv", "Kavish", "Navneet",
  "Aarav", "Yash", "Manav", "Varun", "Ritesh", "Mohit", "Nitin", "Deepak", "Akash", "Rohit",
  "Harsh", "Tushar", "Pranav", "Kartik", "Dev", "Om", "Lakshya", "Ankit", "Vivek", "Saurabh",
  "Abhishek", "Aryan", "Shivam", "Krishna", "Nikhil", "Piyush", "Kunal", "Sameer", "Tarun", "Uday",
  "Vikas", "Raghav", "Mayank", "Lokesh", "Manish", "Naveen", "Pankaj", "Sachin", "Sunil", "Vijay",
  "Yogesh", "Zaid", "Adarsh", "Chirag", "Darshan", "Gaurav", "Himanshu", "Jatin", "Kapil", "Madhav",
  "Arnav", "Atharv", "Ayaan", "Bhavesh", "Chandan", "Chetan", "Danish", "Eshan", "Farhan", "Gagan",
  "Girish", "Hardik", "Hemant", "Ishaan", "Jagdish", "Jayesh", "Kailash", "Keshav", "Kishore", "Lalit",
  "Mahesh", "Manoj", "Mukesh", "Naresh", "Nakul", "Naman", "Nirav", "Niranjan", "Omkar", "Palash",
  "Parag", "Paresh", "Pradeep", "Prashant", "Pratik", "Praveen", "Prem", "Pulkit", "Rajat", "Rakesh",
  "Ramesh", "Ravindra", "Rishabh", "Rituraj", "Roshan", "Rudra", "Sagar", "Salman", "Sanjay", "Santosh",
  "Sarvesh", "Shailesh", "Shashank", "Shyam", "Soham", "Somesh", "Sourav", "Srinivas", "Subhash", "Sudarshan",
  "Sumit", "Suraj", "Surendra", "Sushant", "Swapnil", "Tanmay", "Tilak", "Umesh", "Utkarsh", "Vaibhav",
  "Varad", "Vasu", "Vedant", "Veer", "Vimal", "Vinay", "Vinod", "Viraj", "Vishal", "Vishnu",
  "Yatin", "Yuvraj", "Aadesh", "Ajeet", "Ajit", "Akshay", "Amar", "Amol", "Anand", "Anay",
  "Anirudh", "Anup", "Anurag", "Ashok", "Ashwin", "Avinash", "Balraj", "Bhavin", "Bhupendra", "Brijesh",
  "Chaitanya", "Chintan", "Darpan", "Daya", "Devansh", "Dhiraj", "Dinesh", "Dipesh", "Divyesh", "Durgesh",
  "Ekansh", "Eklavya", "Firoz", "Gautam", "Ghanshyam", "Govind", "Hareesh", "Harindra", "Harshad", "Inder",
  "Indrajit", "Jai", "Janak", "Jigar", "Jitendra", "Jivraj", "Kabir", "Kailesh", "Kamal", "Kamlesh",
  "Karanveer", "Kaushal", "Ketan", "Kirit", "Kripal", "Kuldeep", "Kush", "Lakhan", "Laxman", "Mahavir",
  "Manthan", "Mitesh", "Mohan", "Murali", "Nandan", "Narayan", "Naveenraj", "Nilesh", "Nitinraj", "Ojas",
  "Padmanabha", "Parimal", "Prabhat", "Prakash", "Pramod", "Pranay", "Prithvi", "Rachit", "Rajeev", "Rajendra",
  "Rajiv", "Raman", "Rameshwar", "Ranjit", "Ratul", "Ravish", "Rishi", "Riteshwar", "Riturajit", "Rudransh",
  "Samar", "Samarth", "Samrat", "Sharan", "Sharad", "Shivendra", "Shlok", "Shravan", "Shreyansh", "Shyamraj",
  "Siddhant", "Smit", "Sohail", "Sudarsh", "Suhas", "Sumeet", "Suresh", "Suryansh", "Tarakesh", "Teerth",
  "Trilok", "Udit", "Upendra", "Vaidev", "Varindra", "Ved", "Vignesh", "Vikrant", "Vineet", "Virendra",
  "Vishvajit", "Yashwant", "Yogendra",
  // Added — Female
  "Aisha", "Riya", "Tanvi", "Ishita", "Kriti", "Aditi", "Shruti", "Nandini", "Sakshi", "Muskan",
  "Komal", "Radhika", "Sonal", "Payal", "Shreya", "Priti", "Nikita", "Juhi", "Mansi", "Alisha",
  "Ananya", "Bhavna", "Chandni", "Deepika", "Esha", "Falguni", "Garima", "Hina", "Jasmin", "Kajal",
  "Khushi", "Lavanya", "Megha", "Neelam", "Ojasvi", "Pallavi", "Ritu", "Sanya", "Trisha", "Urvi",
  "Vaishnavi", "Wamika", "Yamini", "Zoya", "Aarohi", "Charvi", "Diya", "Ira", "Kavya", "Myra",
  "Aanchal", "Aarya", "Abha", "Apoorva", "Arpita", "Ashima", "Asmita", "Avni", "Barkha", "Bhavika",
  "Bhoomi", "Chaitali", "Charu", "Damini", "Darshana", "Devika", "Dhriti", "Dipali", "Drishti", "Eesha",
  "Ekta", "Fariha", "Gauri", "Gayatri", "Geeta", "Gitanjali", "Gunjan", "Harini", "Heena", "Himani",
  "Indira", "Indu", "Ishani", "Jagruti", "Janvi", "Jaya", "Jayanti", "Jyoti", "Kalpana", "Kanchan",
  "Kanika", "Karishma", "Kashish", "Kaveri", "Kiran", "Kirti", "Kusum", "Lata", "Leena", "Madhavi",
  "Madhuri", "Mahima", "Malini", "Mamta", "Mandira", "Manisha", "Manjari", "Medha", "Minakshi", "Minal",
  "Mithila", "Mohini", "Mridula", "Mrinalini", "Namrata", "Narmada", "Niharika", "Nimisha", "Niranjana", "Nitya",
  "Padma", "Padmini", "Pari", "Parnika", "Pavitra", "Poonam", "Pragati", "Pranali", "Prarthana", "Preeti",
  "Priyanka", "Purva", "Rachana", "Ragini", "Rajani", "Raksha", "Ramya", "Ranjana", "Rashmi", "Rekha",
  "Renuka", "Reshma", "Richa", "Riddhi", "Ritika", "Roshni", "Ruchi", "Rujuta", "Rupali", "Sabina",
  "Sadhana", "Sakina", "Saloni", "Samaira", "Samata", "Sangeeta", "Sanjana", "Sarika", "Seema", "Shaila",
  "Shalini", "Shanta", "Sharmila", "Sheetal", "Shefali", "Shilpa", "Shivani", "Shobha", "Shuchi", "Shweta",
  "Smita", "Snehal", "Sonia", "Sowmya", "Srishti", "Sujata", "Sukanya", "Suman", "Sumedha", "Sunaina",
  "Sunita", "Supriya", "Surabhi", "Surekha", "Swara", "Swati", "Tanisha", "Tapasya", "Tejal", "Tripti",
  "Tulika", "Uma", "Upasana", "Urmi", "Urvashi", "Usha", "Vaidehi", "Varsha", "Vedika", "Veena",
  "Vibha", "Vidhi", "Vidya", "Vinita", "Vishakha", "Yashika", "Yogita",
]

// Random time strings for realism
const TIME_AGO = ["2 min ago", "5 min ago", "just now", "8 min ago", "12 min ago", "1 min ago"]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface SocialProofToastProps {
  isFree: boolean
  isEnrolled?: boolean
}

export function SocialProofToast({ isFree, isEnrolled }: SocialProofToastProps) {
  if (isEnrolled) return null
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [name, setName] = useState(NAMES[0])
  const [timeAgo, setTimeAgo] = useState(TIME_AGO[0])

  useEffect(() => {
    // Show first popup after 3 seconds
    const initial = setTimeout(() => showNext(), 3000)
    return () => clearTimeout(initial)
  }, [])

  function showNext() {
    setName(pickRandom(NAMES))
    setTimeAgo(pickRandom(TIME_AGO))
    setAnimating(true)
    setVisible(true)

    // Hide after 4 seconds
    const hideTimer = setTimeout(() => {
      setAnimating(false)
      setTimeout(() => {
        setVisible(false)
        // Show next after 6 seconds gap
        setTimeout(showNext, 6000)
      }, 400)
    }, 4000)

    return () => clearTimeout(hideTimer)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        zIndex: 9999,
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: animating ? 1 : 0,
        transform: animating ? "translateY(0) translateX(0)" : "translateY(8px) translateX(-8px)",
      }}
    >
      <div className="flex items-center gap-3 bg-background border border-border rounded-2xl shadow-xl px-4 py-3 max-w-xs">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
          {name.charAt(0)}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground leading-tight">
            <span className="text-primary">{name}</span>{" "}
            {isFree ? "has just registered for this course" : "has just bought this course"}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isFree ? (
              <UserCheck className="h-3 w-3 text-primary shrink-0" />
            ) : (
              <ShoppingBag className="h-3 w-3 text-primary shrink-0" />
            )}
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
