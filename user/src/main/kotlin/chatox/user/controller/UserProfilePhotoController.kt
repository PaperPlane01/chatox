package chatox.user.controller

import chatox.platform.security.reactive.annotation.ReactivePermissionCheck
import chatox.user.api.request.CreateUserProfilePhotoRequest
import chatox.user.api.request.DeleteMultipleUserProfilePhotosRequest
import chatox.user.api.request.SetUserProfilePhotoAsAvatarRequest
import chatox.user.service.UserProfilePhotoService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
class UserProfilePhotoController(private val userProfilePhotoService: UserProfilePhotoService) {

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@userProfilePhotoPermissions.canCreateUserProfilePhoto(#userId)")
    @PostMapping("/{userId}/photos")
    fun createUserProfilePhoto(
            @PathVariable userId: String,
            @RequestBody @Valid createUserProfilePhotoRequest: CreateUserProfilePhotoRequest
    ) = userProfilePhotoService.createUserProfilePhoto(userId, createUserProfilePhotoRequest)

    @GetMapping("/{userId}/photos")
    fun getUserProfilePhotos(@PathVariable userId: String) = userProfilePhotoService.getUserProfilePhotos(userId)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@userProfilePhotoPermissions.canCreateUserProfilePhoto(#userId)")
    @PutMapping("/{userId}/photos/{userProfilePhotoId}")
    fun setUserProfilePhotoAsAvatar(
            @PathVariable userId: String,
            @PathVariable userProfilePhotoId: String,
            @RequestBody @Valid setUserProfilePhotoAsAvatarRequest: SetUserProfilePhotoAsAvatarRequest
    ) = userProfilePhotoService.setUserProfilePhotoAsAvatar(userId, userProfilePhotoId, setUserProfilePhotoAsAvatarRequest)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@userProfilePhotoPermissions.canDeleteUserProfilePhoto(#userId)")
    @DeleteMapping("/{userId}/photos/{userProfilePhotoId}")
    fun deleteUserProfilePhoto(
            @PathVariable userId: String,
            @PathVariable userProfilePhotoId: String
    ) = userProfilePhotoService.deleteUserProfilePhoto(userId, userProfilePhotoId)

    @PreAuthorize("hasRole('USER')")
    //language=SpEL
    @ReactivePermissionCheck("@userProfilePhotoPermissions.canDeleteUserProfilePhoto(#userId)")
    @DeleteMapping("/{userId}/photos")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteMultipleUserProfilePhotos(
            @PathVariable userId: String,
            @RequestBody @Valid deleteMultipleUserProfilePhotosRequest: DeleteMultipleUserProfilePhotosRequest
    ) = userProfilePhotoService.deleteMultipleUserProfilePhotos(userId, deleteMultipleUserProfilePhotosRequest)
}