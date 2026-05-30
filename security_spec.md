# Security Specifications and Test Cases

## Data Invariants
1. **Public Submissions**: Anyone can submit an enquiry, but once written, enquiries are strictly read-only and delete-only for authenticated admins.
2. **Media Content (Gallery/Videos/Testimonials)**: Public users can read training videos, testimonials, and gallery images, but only authorized admins (`godwinjijo789@gmail.com`, `trainwithjijo@gmail.com`) can create, update, or delete content.
3. **Admin Exclusivity**: Admin checks are enforced at the rules layer via token email and verification checks to prevent identity spoofing.

## The "Dirty Dozen" Malicious Payloads

1. **Spoofed Admin Flag (Identity Spoofing)**
```json
{
  "collection": "users",
  "data": { "uid": "victim_uid", "email": "attacker@gmail.com", "role": "admin" }
}
```
*Expected: PERMISSION_DENIED*

2. **Self-Approved Privilege Escalation on Creation**
```json
{
  "collection": "homepageContent",
  "data": { "heroTitle": "Hacked Title", "statsClientsCount": "1000" }
}
```
*Expected: PERMISSION_DENIED (Write attempted by unauthenticated user)*

3. **Orphaned Enquiry Creation (No timestamp validation)**
```json
{
  "collection": "enquiries",
  "data": {
    "id": "enq_123",
    "name": "Attacker",
    "mobile": "1234567890",
    "email": "attacker@gmail.com",
    "goal": "Gain Weight",
    "message": "Enquiry",
    "timestamp": "2020-01-01T00:00:00Z"
  }
}
```
*Expected: PERMISSION_DENIED (Timestamp MUST equal request.time)*

4. **Shadow field in Gallery Creation**
```json
{
  "collection": "gallery",
  "data": {
    "id": "gal_1",
    "title": "Muscle",
    "category": "Muscle Gain",
    "imageUrl": "https://attacker.com/malicious.png",
    "type": "workout",
    "createdAt": "request.time",
    "maliciousField": "leak"
  }
}
```
*Expected: PERMISSION_DENIED (Strict key size enforcement fails)*

5. **Resource Poisoning on Id**
Providing a document ID that is 1MB long or contains malicious path characters.
*Expected: PERMISSION_DENIED (isValidId checks block irregular strings)*

6. **Denial-of-Wallet Recursive Threat**
Querying lists blindly without any restriction or reading the database O(n).
*Expected: Enforced boundary check on request validation order*

7. **Invalid Enum Value in Gallery**
```json
{
  "collection": "gallery",
  "data": {
    "id": "gal_2",
    "title": "Yoga",
    "category": "Invalid Category",
    "imageUrl": "https://picsum.photos/img",
    "type": "transformation",
    "createdAt": "request.time"
  }
}
```
*Expected: PERMISSION_DENIED (Enum validations check categories)*

8. **Over-sized text input**
Submitting a message in Enquiries that is 2MB long.
*Expected: PERMISSION_DENIED (String size validation: must be <= 5000 characters)*

9. **Modifying Immortal Fields**
Attempting to update `createdAt` field in a video item or testimonial.
*Expected: PERMISSION_DENIED (createdAt check enforces equality between existing and incoming)*

10. **Unverified Admin Email Login**
Logging in with email `godwinjijo789@gmail.com` but with `email_verified = false`.
*Expected: PERMISSION_DENIED (Rules check token.email_verified == true)*

11. **Anomalous Enquiry Status Update**
Attempting to modify and overwrite an enquiry document after creation.
*Expected: PERMISSION_DENIED (Only admins can read/delete enquiries, non-admins cannot update)*

12. **Malicious Public Write to Testimonials**
```json
{
  "collection": "testimonials",
  "data": { "clientName": "Scammer", "rating": 5, "review": "Spam message" }
}
```
*Expected: PERMISSION_DENIED (Testimonial writes require verified admin credentials)*
