
const genrateMessage = (entity)=>({
    alreadyExist:`${entity} already exist`,
    notfound:`${entity} not found`,
    failtocreate:`fail to create ${entity}`,
    failtoUpdate:`fail to update ${entity}`,
    failtoDelete:`fail to delete ${entity}`,
    createSuccessfully:`${entity} created successfully`,
    updateSuccessfully:`${entity} updated successfully`,
    deleteSuccessfully:`${entity} deleted successfully`,
    getsuccessfully:`${entity} retrieved successfully`,
    verified:`${entity} verified successfully`,
    notverified:`${entity} not verified`,
    invalidCreadintials:`invalid creadintials`,
    loginSuccessfully:`login successfully`,
    notauthorized:`not authorized`,
    addToWishlist:'added to wishlist successfully',
    invalidAmount:'invalid amount',
    outOfStock:'out of stock',
    otpAlreadySent:'otp already sent',
    contentRequired:'content is required',
    notFound:`${entity} not found`,
    logoutsuccessfully:'logout successfully',
    contentRequired:'content is required',
    emailRequired:'email is required',
    invalidMinistry:'invalid ministry',
})
export const messages = {
    user:genrateMessage('user'),
    file:{required:'file is required'},
    review:genrateMessage('review'),
    ministry:genrateMessage('ministry'),

}